import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useConfetti } from "@/hooks/useConfetti";
import { useAccount } from "wagmi";
import { useSynapse } from "@/providers/synapseprovider";

export type UploadedInfo = {
  fileName?: string;
  fileSize?: number;
  pieceCid?: string;
  txHash?: string;
  pieceId?: number;
  dataSetId?: number;
  providerAddress?: string;
  videoId?: number; // Database ID after server storage
};

export type UploadStage =
  | "initializing"
  | "preflight"
  | "context_setup"
  | "uploading"
  | "piece_addition"
  | "confirmation"
  | "server_storage"
  | "completed"
  | "error";

/**
 * Optimized hook to upload files to Filecoin using Synapse SDK.
 * Follows the latest SDK patterns and automatically stores metadata on server.
 */
export const useFileUpload = () => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [stage, setStage] = useState<UploadStage>("initializing");
  const [uploadedInfo, setUploadedInfo] = useState<UploadedInfo | null>(null);
  const [detailedProgress, setDetailedProgress] = useState({
    preflight: false,
    contextSetup: false,
    uploaded: false,
    pieceAdded: false,
    confirmed: false,
    serverStored: false,
  });

  const { synapse, storageContext, isInitialized } = useSynapse();
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
        if (!synapse || !isInitialized) {
          throw new Error(
            "Synapse SDK not initialized. Please wait or reconnect your wallet."
          );
        }
        if (!address) throw new Error("Wallet not connected");

        // Initialize upload state
        setProgress(0);
        setUploadedInfo(null);
        setDetailedProgress({
          preflight: false,
          contextSetup: false,
          uploaded: false,
          pieceAdded: false,
          confirmed: false,
          serverStored: false,
        });

        updateProgress(
          0,
          "🔄 Initializing file upload to Filecoin...",
          "initializing"
        );

        // Validate file size according to Synapse SDK limits
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

        // 2) Preflight checks - validate allowances and costs
        updateProgress(5, "💰 Running preflight checks...", "preflight");
        const preflightInfo = await synapse.storage.preflightUpload(file.size, {
          withCDN: true,
        });

        if (!preflightInfo.allowanceCheck.sufficient) {
          throw new Error(
            "Insufficient allowances for storage. Please check your USDFC balance and approve the service."
          );
        }

        console.log("Preflight info:", preflightInfo);
        setDetailedProgress((prev) => ({ ...prev, preflight: true }));
        updateProgress(15, "✅ Preflight checks passed", "preflight");

        // 3) Use existing storage context or create new one
        updateProgress(20, "🔗 Setting up storage context...", "context_setup");
        let uploadContext = storageContext;

        if (!uploadContext) {
          updateProgress(25, "🏗️ Creating storage context...", "context_setup");
          uploadContext = await synapse.storage.createContext({
            withCDN: true,
            metadata: {
              contentType: "video",
              fileName: file.name,
              fileType: file.type,
              uploadTimestamp: new Date().toISOString(),
            },
          });
        }

        setDetailedProgress((prev) => ({
          ...prev,
          contextSetup: true,
        }));

        setUploadedInfo((prev) => ({
          ...prev,
          fileName: file.name,
          fileSize: file.size,
          dataSetId: uploadContext!.dataSetId,
          providerAddress: uploadContext!.serviceProvider,
        }));

        updateProgress(40, "📁 Uploading to Filecoin storage...", "uploading");

        // 4) Upload file using the optimized SDK patterns
        const result = await uploadContext.upload(uint8ArrayBytes, {
          metadata: {
            fileName: file.name,
            fileType: file.type,
            uploadTimestamp: new Date().toISOString(),
            fileSizeMB: fileSizeInMB.toFixed(2),
            uploadedBy: address,
          },
          onUploadComplete: (pieceCid) => {
            console.log("Upload complete:", pieceCid);
            updateProgress(
              60,
              `📊 File uploaded! PieceCID: ${pieceCid
                .toString()
                .slice(0, 12)}...`,
              "uploading"
            );
            setDetailedProgress((prev) => ({ ...prev, uploaded: true }));
            setUploadedInfo((prev) => ({
              ...prev,
              pieceCid: pieceCid.toString(),
            }));
          },
          onPieceAdded: (transactionResponse) => {
            console.log("Piece addition:", transactionResponse);
            updateProgress(
              75,
              "🔄 Adding piece to dataset...",
              "piece_addition"
            );
            setDetailedProgress((prev) => ({ ...prev, pieceAdded: true }));

            if (transactionResponse) {
              setUploadedInfo((prev) => ({
                ...prev,
                txHash: transactionResponse.hash,
              }));
            }
          },
          onPieceConfirmed: (pieceIds) => {
            console.log("Piece confirmed with IDs:", pieceIds);
            updateProgress(
              85,
              "🌳 Piece confirmed on blockchain",
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

        updateProgress(
          88,
          "💾 Storing metadata on server...",
          "server_storage"
        );

        // 5) Store video metadata on the server after successful upload
        try {
          const serverResponse = await fetch("/api/videos/create", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              publicAddress: address,
              title: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension for title
              description: `Uploaded video file: ${
                file.name
              } (${fileSizeInMB.toFixed(2)} MB)`,
              cid: result.pieceCid.toString(),
              tags: ["video", "upload"],
              metadata: {
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                pieceId: result.pieceId,
                dataSetId: uploadContext.dataSetId,
                providerAddress: uploadContext.serviceProvider,
                uploadTimestamp: new Date().toISOString(),
              },
            }),
          });

          if (serverResponse.ok) {
            const serverData = await serverResponse.json();
            console.log("Video metadata stored on server:", serverData);
            setUploadedInfo((prev) => ({
              ...prev,
              videoId: serverData.data?.id,
            }));
            setDetailedProgress((prev) => ({ ...prev, serverStored: true }));
            updateProgress(
              95,
              "✅ Metadata stored on server",
              "server_storage"
            );
          } else {
            console.warn(
              "Failed to store metadata on server:",
              serverResponse.statusText
            );
            updateProgress(
              92,
              "⚠️ Upload successful, server storage failed",
              "completed"
            );
          }
        } catch (serverError) {
          console.warn("Server storage error:", serverError);
          updateProgress(
            92,
            "⚠️ Upload successful, server storage failed",
            "completed"
          );
        }

        updateProgress(100, "🎉 Upload completed successfully!", "completed");

        const finalUploadedInfo: UploadedInfo = {
          fileName: file.name,
          fileSize: file.size,
          pieceCid: result.pieceCid.toString(),
          pieceId: result.pieceId,
          dataSetId: uploadContext.dataSetId,
          providerAddress: uploadContext.serviceProvider,
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
      triggerConfetti();
    },
    onError: (error) => {
      console.error("Upload mutation failed:", error);
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
      uploaded: false,
      pieceAdded: false,
      confirmed: false,
      serverStored: false,
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
