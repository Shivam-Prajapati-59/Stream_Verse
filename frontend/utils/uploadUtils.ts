import { Synapse } from "@filoz/synapse-sdk";

/**
 * Optimized file upload validation using the latest Synapse SDK patterns
 */
export const validateFileUpload = async (
  file: File,
  synapse: Synapse
): Promise<{
  isValid: boolean;
  error?: string;
  preflightInfo?: any;
}> => {
  try {
    // Size validation
    if (file.size < 127) {
      return {
        isValid: false,
        error: "File too small. Minimum size is 127 bytes.",
      };
    }

    if (file.size > 200 * 1024 * 1024) {
      return {
        isValid: false,
        error: "File too large. Maximum size is 200 MiB.",
      };
    }

    // Run preflight check with the SDK
    const preflightInfo = await synapse.storage.preflightUpload(file.size, {
      withCDN: true,
    });

    if (!preflightInfo.allowanceCheck.sufficient) {
      return {
        isValid: false,
        error:
          "Insufficient allowances for storage. Please check your USDFC balance and approve the service.",
        preflightInfo,
      };
    }

    return {
      isValid: true,
      preflightInfo,
    };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : "Validation failed",
    };
  }
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Check if file type is supported for video uploads
 */
export const isVideoFile = (file: File): boolean => {
  const videoTypes = [
    "video/mp4",
    "video/webm",
    "video/ogg",
    "video/avi",
    "video/mov",
    "video/wmv",
    "video/flv",
    "video/mkv",
  ];

  return videoTypes.includes(file.type);
};

/**
 * Generate a clean title from filename
 */
export const generateVideoTitle = (filename: string): string => {
  return filename
    .replace(/\.[^/.]+$/, "") // Remove extension
    .replace(/[_-]/g, " ") // Replace underscores and hyphens with spaces
    .replace(/\b\w/g, (l) => l.toUpperCase()); // Capitalize first letter of each word
};
