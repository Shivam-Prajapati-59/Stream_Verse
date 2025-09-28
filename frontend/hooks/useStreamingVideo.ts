import { useState, useCallback, useRef, useEffect } from "react";
import { useSimpleX402Payment } from "./useSimpleX402Payment";
import { useSynapse } from "@/providers/synapseprovider";
import {
  getVideoMetadata,
  calculateChunkConfig,
  type VideoMetadata,
} from "@/utils/videoUtils";

interface VideoChunk {
  data: ArrayBuffer;
  chunkIndex: number;
  timestamp: number;
  transactionHash?: string;
}

interface StreamingVideoOptions {
  chunkDurationSeconds?: number;
  pricePerChunk?: string;
}

export const useStreamingVideo = (
  videoCommp: string,
  options: StreamingVideoOptions = {}
) => {
  const [currentChunk, setCurrentChunk] = useState<VideoChunk | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [totalPaid, setTotalPaid] = useState(0);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [transactionHashes, setTransactionHashes] = useState<string[]>([]);
  const [videoMetadata, setVideoMetadata] = useState<VideoMetadata | null>(
    null
  );

  const chunkDuration = options.chunkDurationSeconds || 10;
  const pricePerChunk = options.pricePerChunk || "0.001";

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const videoChunksRef = useRef<ArrayBuffer[]>([]);
  const currentChunkIndexRef = useRef(0);

  const { makePayment, isLoading: isPaymentLoading } = useSimpleX402Payment();
  const { synapse } = useSynapse();

  // Download and prepare video data from Synapse
  const loadVideoData = useCallback(async () => {
    if (!synapse || !videoCommp) return;

    try {
      setError(null);
      console.log("Loading video data from Synapse...", videoCommp);

      // Load real video from Synapse
      const uint8ArrayBytes = await synapse.storage.download(videoCommp);

      // Create a new Uint8Array to ensure proper buffer type
      const properUint8Array = new Uint8Array(uint8ArrayBytes);
      const blob = new Blob([properUint8Array], { type: "video/mp4" });
      setVideoBlob(blob);

      // Get actual video metadata including real duration
      const metadata = await getVideoMetadata(blob);
      setVideoMetadata(metadata);

      // Calculate chunks based on actual video duration
      const chunkConfig = calculateChunkConfig(metadata, chunkDuration);

      // Split video data into chunks based on actual duration
      const chunks: ArrayBuffer[] = [];
      for (let i = 0; i < chunkConfig.totalChunks; i++) {
        const startByte = Math.floor(
          (i * properUint8Array.length) / chunkConfig.totalChunks
        );
        const endByte = Math.floor(
          ((i + 1) * properUint8Array.length) / chunkConfig.totalChunks
        );
        const chunk = properUint8Array.slice(startByte, endByte);
        chunks.push(chunk.buffer);
      }

      videoChunksRef.current = chunks;
      console.log(
        `✅ Video loaded from Synapse:`,
        `📁 Size: ${(metadata.size / 1024 / 1024).toFixed(2)}MB`,
        `⏱️ Duration: ${Math.floor(metadata.duration / 60)}:${String(
          Math.floor(metadata.duration % 60)
        ).padStart(2, "0")}`,
        `🧩 Chunks: ${chunks.length} (${chunkDuration}s each)`,
        `💰 Total cost: $${chunkConfig.estimatedTotalCost.toFixed(3)}`
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load video";
      setError(errorMessage);
      console.error("Error loading video:", err);
    }
  }, [synapse, videoCommp, chunkDuration]);

  // Pay for and load next chunk
  const loadNextChunk = useCallback(async () => {
    const chunkIndex = currentChunkIndexRef.current;

    if (chunkIndex >= videoChunksRef.current.length) {
      console.log("Video playback complete");
      setIsPlaying(false);
      return;
    }

    try {
      console.log(`Requesting payment for chunk ${chunkIndex + 1}...`);

      // Make payment for the chunk - call the streaming server
      const paymentResult = await makePayment(
        `http://localhost:4021/api/video/chunk?chunkIndex=${chunkIndex}&commp=${videoCommp}`
      );

      if (!paymentResult.success) {
        throw new Error(paymentResult.error || "Payment failed");
      }

      // Use the local chunk data (in real implementation, this would come from the API)
      const chunkData = videoChunksRef.current[chunkIndex];

      // Store transaction hash
      if (paymentResult.transactionHash) {
        setTransactionHashes((prev) => [
          ...prev,
          paymentResult.transactionHash!,
        ]);
      }

      setCurrentChunk({
        data: chunkData,
        chunkIndex,
        timestamp: Date.now(),
        transactionHash: paymentResult.transactionHash,
      });

      setTotalPaid((prev) => prev + parseFloat(pricePerChunk));
      setCurrentTime(chunkIndex * chunkDuration);
      currentChunkIndexRef.current += 1;

      console.log(
        `✅ Chunk ${chunkIndex + 1} loaded successfully!`,
        `💰 Total paid: $${(totalPaid + parseFloat(pricePerChunk)).toFixed(3)}`,
        `🔗 TX: ${paymentResult.transactionHash}`
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load chunk";
      setError(errorMessage);
      setIsPlaying(false);
      console.error("Error loading chunk:", err);
    }
  }, [makePayment, videoCommp, chunkDuration, pricePerChunk, totalPaid]);

  // Start streaming
  const startStreaming = useCallback(async () => {
    if (videoChunksRef.current.length === 0) {
      await loadVideoData();
    }

    if (videoChunksRef.current.length === 0) {
      setError("No video data available");
      return;
    }

    setIsPlaying(true);
    setError(null);

    // Load first chunk immediately
    await loadNextChunk();

    // Set up interval for subsequent chunks
    intervalRef.current = setInterval(async () => {
      await loadNextChunk();
    }, chunkDuration * 1000);
  }, [loadVideoData, loadNextChunk, chunkDuration]);

  // Stop streaming
  const stopStreaming = useCallback(() => {
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Reset streaming
  const resetStreaming = useCallback(() => {
    stopStreaming();
    currentChunkIndexRef.current = 0;
    setCurrentTime(0);
    setCurrentChunk(null);
    setTotalPaid(0);
    setError(null);
    setTransactionHashes([]);
    setVideoMetadata(null);
  }, [stopStreaming]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    // State
    currentChunk,
    isPlaying,
    currentTime,
    error,
    totalPaid,
    videoBlob,
    isLoading: isPaymentLoading,
    transactionHashes,
    videoMetadata,

    // Actions
    startStreaming,
    stopStreaming,
    resetStreaming,

    // Info
    chunkDuration,
    pricePerChunk: parseFloat(pricePerChunk),
    totalChunks: videoChunksRef.current.length,
    currentChunkIndex: currentChunkIndexRef.current,
  };
};
