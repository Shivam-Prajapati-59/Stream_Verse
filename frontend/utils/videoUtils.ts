/**
 * Utility to extract video metadata including duration
 */

export interface VideoMetadata {
  duration: number; // in seconds
  width?: number;
  height?: number;
  bitrate?: number;
  size: number; // file size in bytes
}

/**
 * Get video metadata from a blob/file
 */
export const getVideoMetadata = (blob: Blob): Promise<VideoMetadata> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const url = URL.createObjectURL(blob);

    video.preload = "metadata";
    video.muted = true;

    video.onloadedmetadata = () => {
      const metadata: VideoMetadata = {
        duration: video.duration || 120, // fallback to 2 minutes if unknown
        width: video.videoWidth,
        height: video.videoHeight,
        size: blob.size,
      };

      URL.revokeObjectURL(url);
      resolve(metadata);
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      // Fallback metadata for non-video files or corrupted videos
      const fallbackMetadata: VideoMetadata = {
        duration: Math.max(60, Math.ceil(blob.size / (1024 * 1024)) * 30), // 30 seconds per MB estimate
        size: blob.size,
      };
      console.warn(
        "Could not load video metadata, using fallback:",
        fallbackMetadata
      );
      resolve(fallbackMetadata);
    };

    video.src = url;
  });
};

/**
 * Calculate optimal chunk configuration based on video metadata
 */
export const calculateChunkConfig = (
  metadata: VideoMetadata,
  chunkDurationSeconds: number = 10
) => {
  const totalChunks = Math.ceil(metadata.duration / chunkDurationSeconds);
  const bytesPerChunk = Math.ceil(metadata.size / totalChunks);

  return {
    totalChunks,
    bytesPerChunk,
    actualDuration: metadata.duration,
    estimatedTotalCost: totalChunks * 0.001, // $0.001 per chunk
    chunkDurationSeconds,
  };
};
