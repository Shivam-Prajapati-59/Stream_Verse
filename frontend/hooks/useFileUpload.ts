import { useState } from "react";
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
};

/**
 * Hook to upload a file to the Filecoin network using Synapse.
 */
export const useFileUpload = () => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [uploadedInfo, setUploadedInfo] = useState<UploadedInfo | null>(null);
  const { synapse } = useSynapse();
  const { triggerConfetti } = useConfetti();
  const { address } = useAccount();

  const mutation = useMutation({
    mutationKey: ["file-upload", address],
    mutationFn: async (file: File) => {
      if (!synapse) throw new Error("Synapse not found");
      if (!address) throw new Error("Address not found");

      setProgress(0);
      setUploadedInfo(null);
      setStatus("🔄 Initializing file upload to Filecoin...");

      // 1) Convert File → ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      // 2) Convert ArrayBuffer → Uint8Array
      const uint8ArrayBytes = new Uint8Array(arrayBuffer);

      // 3) Check if we have enough USDFC to cover the storage costs and deposit if not
      setStatus("💰 Checking USDFC balance and storage allowances...");
      setProgress(5);
      await preflightCheck(
        file,
        synapse,
        true, // Include dataset creation fee if no dataset exists
        setStatus,
        setProgress
      );

      setStatus("🔗 Setting up storage context...");
      setProgress(25);

      // 4) Create storage context using the new API
      const context = await synapse.storage.createContext({
        withCDN: true, // Enable CDN for faster retrieval
        callbacks: {
          onDataSetResolved: (info: any) => {
            console.log("Dataset resolved:", info);
            if (info.isExisting) {
              setStatus("🔗 Using existing dataset");
            } else {
              setStatus("🏗️ Creating new dataset...");
            }
            setProgress(30);
          },
          onDataSetCreationStarted: (
            transactionResponse: any,
            statusUrl?: string
          ) => {
            console.log("Dataset creation started:", transactionResponse);
            console.log("Dataset creation status URL:", statusUrl);
            setStatus("🏗️ Creating new dataset on blockchain...");
            setProgress(35);
          },
          onDataSetCreationProgress: (status: any) => {
            console.log("Dataset creation progress:", status);
            if (status.transactionSuccess) {
              setStatus(`⛓️ Dataset transaction confirmed on chain`);
              setProgress(45);
            }
            if (status.serverConfirmed) {
              setStatus(
                `🎉 Dataset ready! (${Math.round(status.elapsedMs / 1000)}s)`
              );
              setProgress(50);
            }
          },
          onProviderSelected: (provider: any) => {
            console.log("Storage provider selected:", provider);
            setStatus(`🏪 Storage provider selected`);
          },
        },
      });

      setStatus("📁 Uploading file to storage provider...");
      setProgress(55);

      // 5) Upload file to storage provider using the context
      const result = await context.upload(uint8ArrayBytes, {
        onUploadComplete: (pieceCid: any) => {
          setStatus(`📊 File uploaded! Adding piece to the dataset...`);
          setUploadedInfo((prev) => ({
            ...prev,
            fileName: file.name,
            fileSize: file.size,
            pieceCid: pieceCid.toString(),
          }));
          setProgress(80);
        },
        onPieceAdded: (transactionResponse: any) => {
          setStatus(
            `🔄 Waiting for transaction to be confirmed on chain${
              transactionResponse
                ? ` (txHash: ${transactionResponse.hash})`
                : ""
            }`
          );
          if (transactionResponse) {
            console.log("Transaction response:", transactionResponse);
            setUploadedInfo((prev) => ({
              ...prev,
              txHash: transactionResponse?.hash,
            }));
          }
          setProgress(85);
        },
        onPieceConfirmed: (pieceIds: any) => {
          setStatus("🌳 Data piece added to dataset successfully");
          setProgress(90);
          console.log("Piece IDs:", pieceIds);
        },
      });

      setProgress(95);
      setUploadedInfo((prev) => ({
        ...prev,
        fileName: file.name,
        fileSize: file.size,
        pieceCid: result.pieceCid.toString(),
      }));

      return result;
    },
    onSuccess: () => {
      setStatus("🎉 File successfully stored on Filecoin!");
      setProgress(100);
      triggerConfetti();
    },
    onError: (error) => {
      console.error("Upload failed:", error);
      setStatus(`❌ Upload failed: ${error.message || "Please try again"}`);
      setProgress(0);
    },
  });

  const handleReset = () => {
    setProgress(0);
    setUploadedInfo(null);
    setStatus("");
  };

  return {
    uploadFileMutation: mutation,
    progress,
    uploadedInfo,
    handleReset,
    status,
  };
};
