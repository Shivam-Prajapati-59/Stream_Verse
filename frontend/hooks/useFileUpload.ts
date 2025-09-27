import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useConfetti } from "@/hooks/useConfetti";
import { useAccount } from "wagmi";
import { preflightCheck } from "@/utils/fileuploadchecks";
import { useSynapse } from "@/providers/synapseprovider";

export type UploadedInfo = {
  fileName?: string;
  fileSize?: number;
  pieceCid?: string;
  txHash?: string;
  pieceId?: number;
  dataSetId?: number;
  providerAddress?: string;
};

export type UploadStage =
  | "initializing"
  | "preflight"
  | "context_setup"
  | "provider_selection"
  | "dataset_creation"
  | "uploading"
  | "piece_addition"
  | "confirmation"
  | "completed"
  | "error";

/**
 * Hook to upload a file to the Filecoin network using Synapse SDK.
 * Provides detailed progress tracking and comprehensive error handling.
 */
export const useFileUpload = () => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [stage, setStage] = useState<UploadStage>("initializing");
  const [uploadedInfo, setUploadedInfo] = useState<UploadedInfo | null>(null);
  const [detailedProgress, setDetailedProgress] = useState({
    preflight: false,
    contextSetup: false,
    providerSelected: false,
    datasetReady: false,
    uploaded: false,
    pieceAdded: false,
    confirmed: false,
  });

  const { synapse } = useSynapse();
  const { triggerConfetti } = useConfetti();
  const { address } = useAccount();

  const updateProgress = useCallback(
    (newProgress: number, newStatus: string, newStage: UploadStage) => {
      setProgress(newProgress);
      setStatus(newStatus);
      setStage(newStage);
    },
    []
  );

  const mutation = useMutation({
    mutationKey: ["file-upload", address],
    mutationFn: async (file: File) => {
      try {
        if (!synapse) throw new Error("Synapse SDK not initialized");
        if (!address) throw new Error("Wallet not connected");

        // Initialize upload state
        setProgress(0);
        setUploadedInfo(null);
        setDetailedProgress({
          preflight: false,
          contextSetup: false,
          providerSelected: false,
          datasetReady: false,
          uploaded: false,
          pieceAdded: false,
          confirmed: false,
        });

        updateProgress(
          0,
          "🔄 Initializing file upload to Filecoin...",
          "initializing"
        );

        // Validate file size early
        const fileSizeInMB = file.size / (1024 * 1024);
        if (file.size < 127) {
          throw new Error("File too small. Minimum size is 127 bytes.");
        }
        if (file.size > 200 * 1024 * 1024) {
          throw new Error("File too large. Maximum size is 200 MiB.");
        }

        // 1) Convert File → Uint8Array
        updateProgress(2, "📄 Processing file data...", "initializing");
        const arrayBuffer = await file.arrayBuffer();
        const uint8ArrayBytes = new Uint8Array(arrayBuffer);

        // 2) Preflight checks - payment setup and cost estimation
        updateProgress(5, "💰 Running preflight checks...", "preflight");
        await preflightCheck(
          file,
          synapse,
          true, // Include dataset creation fee if no dataset exists
          (status) => updateProgress(progress + 1, status, "preflight"),
          (prog) => setProgress(Math.max(progress, prog))
        );

        setDetailedProgress((prev) => ({ ...prev, preflight: true }));

        // 3) Run SDK preflight check for detailed cost estimation
        updateProgress(20, "� Calculating storage costs...", "preflight");
        const preflightInfo = await synapse.storage.preflightUpload(file.size, {
          withCDN: true,
          metadata: {
            fileName: file.name,
            fileType: file.type,
            uploadTimestamp: new Date().toISOString(),
          },
        });

        if (!preflightInfo.allowanceCheck.sufficient) {
          throw new Error(
            "Insufficient allowances for storage. Please check your USDFC balance."
          );
        }

        console.log("Preflight info:", preflightInfo);
        updateProgress(25, "🔗 Setting up storage context...", "context_setup");

        // 4) Create storage context with comprehensive callbacks
        let contextCreationTime = Date.now();
        const context = await synapse.storage.createContext({
          withCDN: true, // Enable CDN for faster retrieval
          metadata: {
            fileName: file.name,
            fileType: file.type,
            uploadTimestamp: new Date().toISOString(),
            fileSizeMB: fileSizeInMB.toFixed(2),
          },
          callbacks: {
            onProviderSelected: (provider) => {
              console.log("Storage provider selected:", provider);
              updateProgress(
                30,
                `🏪 Selected provider: ${provider.serviceProvider.slice(
                  0,
                  8
                )}...`,
                "provider_selection"
              );
              setDetailedProgress((prev) => ({
                ...prev,
                providerSelected: true,
              }));
              setUploadedInfo((prev) => ({
                ...prev,
                providerAddress: provider.serviceProvider,
              }));
            },
            onDataSetResolved: (info) => {
              console.log("Dataset resolved:", info);
              const elapsed = Math.round(
                (Date.now() - contextCreationTime) / 1000
              );
              if (info.isExisting) {
                updateProgress(
                  45,
                  `🔗 Using existing dataset #${info.dataSetId} (${elapsed}s)`,
                  "context_setup"
                );
              } else {
                updateProgress(
                  35,
                  `🏗️ Creating new dataset #${info.dataSetId}...`,
                  "dataset_creation"
                );
              }
              setDetailedProgress((prev) => ({ ...prev, contextSetup: true }));
              setUploadedInfo((prev) => ({
                ...prev,
                dataSetId: info.dataSetId,
              }));
            },
            onDataSetCreationStarted: (transactionResponse, statusUrl) => {
              console.log("Dataset creation started:", transactionResponse);
              console.log("Dataset creation status URL:", statusUrl);
              updateProgress(
                40,
                `🏗️ Dataset creation tx: ${transactionResponse.hash.slice(
                  0,
                  10
                )}...`,
                "dataset_creation"
              );
              setUploadedInfo((prev) => ({
                ...prev,
                txHash: transactionResponse.hash,
              }));
            },
            onDataSetCreationProgress: (status) => {
              console.log("Dataset creation progress:", status);
              const elapsed = Math.round(status.elapsedMs / 1000);

              if (status.transactionMined && !status.transactionSuccess) {
                updateProgress(
                  43,
                  `⚠️ Transaction mined but failed (${elapsed}s)`,
                  "dataset_creation"
                );
              } else if (status.transactionSuccess && !status.dataSetLive) {
                updateProgress(
                  46,
                  `⛓️ Transaction confirmed, waiting for dataset (${elapsed}s)`,
                  "dataset_creation"
                );
              } else if (status.dataSetLive && !status.serverConfirmed) {
                updateProgress(
                  48,
                  `📡 Dataset live, awaiting server confirmation (${elapsed}s)`,
                  "dataset_creation"
                );
              } else if (status.serverConfirmed) {
                updateProgress(
                  50,
                  `🎉 Dataset ready! (${elapsed}s)`,
                  "context_setup"
                );
                setDetailedProgress((prev) => ({
                  ...prev,
                  datasetReady: true,
                }));
              }
            },
          },
        });

        setDetailedProgress((prev) => ({
          ...prev,
          contextSetup: true,
          datasetReady: true,
        }));

        // 5) Upload file to storage provider
        updateProgress(
          55,
          "📁 Uploading file to storage provider...",
          "uploading"
        );

        const result = await context.upload(uint8ArrayBytes, {
          onUploadComplete: (pieceCid) => {
            console.log("Upload complete:", pieceCid);
            updateProgress(
              70,
              `📊 File uploaded! PieceCID: ${pieceCid
                .toString()
                .slice(0, 12)}...`,
              "uploading"
            );
            setDetailedProgress((prev) => ({ ...prev, uploaded: true }));
            setUploadedInfo((prev) => ({
              ...prev,
              fileName: file.name,
              fileSize: file.size,
              pieceCid: pieceCid.toString(),
            }));
          },
          onPieceAdded: (transactionResponse) => {
            if (transactionResponse) {
              console.log("Piece addition transaction:", transactionResponse);
              updateProgress(
                80,
                `🔄 Piece addition tx: ${transactionResponse.hash.slice(
                  0,
                  10
                )}...`,
                "piece_addition"
              );
              setUploadedInfo((prev) => ({
                ...prev,
                txHash: transactionResponse.hash,
              }));
            } else {
              updateProgress(
                80,
                "🔄 Adding piece to dataset (legacy server)...",
                "piece_addition"
              );
            }
            setDetailedProgress((prev) => ({ ...prev, pieceAdded: true }));
          },
          onPieceConfirmed: (pieceIds) => {
            console.log("Piece confirmed with IDs:", pieceIds);
            updateProgress(
              90,
              `🌳 Piece confirmed! IDs: ${pieceIds.join(", ")}`,
              "confirmation"
            );
            setDetailedProgress((prev) => ({ ...prev, confirmed: true }));
            if (pieceIds.length > 0) {
              setUploadedInfo((prev) => ({
                ...prev,
                pieceId: pieceIds[0],
              }));
            }
          },
        });

        // Final result processing
        updateProgress(95, "✅ Processing upload result...", "completed");

        const finalUploadedInfo: UploadedInfo = {
          fileName: file.name,
          fileSize: file.size,
          pieceCid: result.pieceCid.toString(),
          pieceId: result.pieceId,
          dataSetId: context.dataSetId,
          providerAddress: context.serviceProvider,
        };

        setUploadedInfo(finalUploadedInfo);

        console.log("Upload completed successfully:", result);
        return result;
      } catch (error) {
        console.error("Upload failed:", error);
        updateProgress(
          0,
          `❌ Upload failed: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          "error"
        );
        throw error;
      }
    },
    onSuccess: () => {
      updateProgress(
        100,
        "🎉 File successfully stored on Filecoin!",
        "completed"
      );
      triggerConfetti();
    },
    onError: (error) => {
      console.error("Upload mutation failed:", error);
      updateProgress(
        0,
        `❌ Upload failed: ${
          error instanceof Error ? error.message : "Please try again"
        }`,
        "error"
      );
    },
  });

  const handleReset = useCallback(() => {
    setProgress(0);
    setUploadedInfo(null);
    setStatus("");
    setStage("initializing");
    setDetailedProgress({
      preflight: false,
      contextSetup: false,
      providerSelected: false,
      datasetReady: false,
      uploaded: false,
      pieceAdded: false,
      confirmed: false,
    });
  }, []);

  return {
    uploadFileMutation: mutation,
    progress,
    uploadedInfo,
    handleReset,
    status,
    stage,
    detailedProgress,
    isUploading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
  };
};
