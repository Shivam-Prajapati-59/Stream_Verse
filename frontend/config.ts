/*
    This is the configuration for the upload dApp using Synapse.
    It is used to configure the storage capacity, the persistence period, and the minimum number of days of lockup needed so the app can notify to pay for more storage.
*/

export const config = {
  // The number of GB of storage capacity needed to be sufficient
  storageCapacity: 50, // Increased for video files
  // The number of days of lockup needed to be sufficient
  persistencePeriod: 90, // Longer persistence for videos
  // The minimum number of days of lockup needed to be sufficient
  minDaysThreshold: 15,
  // Whether to use CDN for the storage for faster retrieval
  withCDN: true,
  // Filecoin network settings
  filecoin: {
    mainnet: {
      chainId: 314,
      rpcUrl: "https://api.node.glif.io/rpc/v1",
    },
    calibration: {
      chainId: 314159,
      rpcUrl: "https://api.calibration.node.glif.io/rpc/v1",
    },
  },
  // Upload settings
  upload: {
    maxFileSize: 200 * 1024 * 1024, // 200 MiB as per Synapse SDK
    minFileSize: 127, // 127 bytes as per Synapse SDK
    supportedVideoTypes: [
      "video/mp4",
      "video/webm",
      "video/ogg",
      "video/avi",
      "video/mov",
      "video/wmv",
    ],
  },
} satisfies {
  storageCapacity: number;
  persistencePeriod: number;
  minDaysThreshold: number;
  withCDN: boolean;
  filecoin: {
    mainnet: { chainId: number; rpcUrl: string };
    calibration: { chainId: number; rpcUrl: string };
  };
  upload: {
    maxFileSize: number;
    minFileSize: number;
    supportedVideoTypes: string[];
  };
};
