import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useSynapse } from "@/providers/synapseprovider";

export type DownloadStage =
  | "initializing"
  | "downloading"
  | "completed"
  | "error";

export type DownloadInfo = {
  pieceCid: string;
  size?: number;
  downloadUrl?: string;
};

/**
 * Optimized hook for downloading files from Filecoin using Synapse SDK
 */
export const useFileDownload = () => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [stage, setStage] = useState<DownloadStage>("initializing");
  const [downloadInfo, setDownloadInfo] = useState<DownloadInfo | null>(null);

  const { synapse, storageContext, isInitialized } = useSynapse();

  const updateProgress = useCallback(
    (newProgress: number, newStatus: string, newStage: DownloadStage) => {
      setProgress(newProgress);
      setStatus(newStatus);
      setStage(newStage);
    },
    []
  );

  const downloadMutation = useMutation({
    mutationFn: async (pieceCid: string) => {
      try {
        if (!synapse || !isInitialized) {
          throw new Error("Synapse SDK not initialized");
        }

        setProgress(0);
        setDownloadInfo({ pieceCid });
        updateProgress(0, "🔄 Initializing download...", "initializing");

        updateProgress(20, "📥 Downloading from Filecoin...", "downloading");

        let downloadedData: Uint8Array;

        // Try to download using the storage context first (faster if it's the same provider)
        if (storageContext) {
          try {
            updateProgress(
              40,
              "📥 Downloading from provider...",
              "downloading"
            );
            downloadedData = await storageContext.download(pieceCid);
          } catch (contextError) {
            console.warn(
              "Provider-specific download failed, trying global download:",
              contextError
            );
            updateProgress(
              50,
              "📥 Trying alternative providers...",
              "downloading"
            );
            downloadedData = await synapse.storage.download(pieceCid);
          }
        } else {
          // Use global download (tries all available providers)
          downloadedData = await synapse.storage.download(pieceCid);
        }

        updateProgress(80, "💾 Processing downloaded data...", "downloading");

        // Create blob URL for download
        const blob = new Blob([new Uint8Array(downloadedData)]);
        const downloadUrl = URL.createObjectURL(blob);

        setDownloadInfo({
          pieceCid,
          size: downloadedData.length,
          downloadUrl,
        });

        updateProgress(100, "✅ Download completed!", "completed");

        return {
          data: downloadedData,
          blob,
          downloadUrl,
          size: downloadedData.length,
        };
      } catch (error) {
        console.error("Download failed:", error);
        updateProgress(
          0,
          `❌ Download failed: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          "error"
        );
        throw error;
      }
    },
  });

  const downloadAndSave = useCallback(
    async (pieceCid: string, filename?: string) => {
      try {
        const result = await downloadMutation.mutateAsync(pieceCid);

        // Trigger browser download
        const link = document.createElement("a");
        link.href = result.downloadUrl;
        link.download = filename || `filecoin-${pieceCid.slice(0, 8)}.bin`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up blob URL after download
        setTimeout(() => {
          URL.revokeObjectURL(result.downloadUrl);
        }, 1000);

        return result;
      } catch (error) {
        throw error;
      }
    },
    [downloadMutation]
  );

  const handleReset = useCallback(() => {
    setProgress(0);
    setDownloadInfo(null);
    setStatus("");
    setStage("initializing");
  }, []);

  return {
    downloadMutation,
    downloadAndSave,
    progress,
    downloadInfo,
    handleReset,
    status,
    stage,
    isDownloading: downloadMutation.isPending,
    isSuccess: downloadMutation.isSuccess,
    isError: downloadMutation.isError,
    error: downloadMutation.error,
  };
};
