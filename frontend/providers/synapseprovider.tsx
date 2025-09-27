"use client";

import { Synapse, RPC_URLS, type StorageContext } from "@filoz/synapse-sdk";
import {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { useEthersSigner } from "@/hooks/useEthers";
import { useAccount } from "wagmi";
import { config } from "@/config";

interface SynapseContextType {
  synapse: Synapse | null;
  storageContext: StorageContext | null;
  isLoading: boolean;
  error: string | null;
  reconnect: () => void;
  isInitialized: boolean;
}

export const SynapseContext = createContext<SynapseContextType>({
  synapse: null,
  storageContext: null,
  isLoading: false,
  error: null,
  reconnect: () => {},
  isInitialized: false,
});

export const SynapseProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [synapse, setSynapse] = useState<Synapse | null>(null);
  const [storageContext, setStorageContext] = useState<StorageContext | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const signer = useEthersSigner();
  const { isConnected, chainId } = useAccount();

  const createSynapse = useCallback(async () => {
    if (!signer || !isConnected) {
      setSynapse(null);
      setStorageContext(null);
      setIsInitialized(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Determine the correct RPC URL based on chain ID
      let rpcURL: string;
      if (chainId === 314) {
        // Filecoin Mainnet
        rpcURL = RPC_URLS.mainnet.websocket;
      } else if (chainId === 314159) {
        // Filecoin Calibration Testnet
        rpcURL = RPC_URLS.calibration.websocket;
      } else {
        // Default to calibration for testing
        console.warn(
          `Unsupported chain ID: ${chainId}, defaulting to Filecoin Calibration`
        );
        rpcURL = RPC_URLS.calibration.websocket;
      }

      console.log(`Initializing Synapse SDK with RPC: ${rpcURL}`);

      const synapseInstance = await Synapse.create({
        signer,
        rpcURL,
        withCDN: config.withCDN,
        disableNonceManager: false,
      });

      // Create a default storage context for video uploads
      const defaultStorageContext = await synapseInstance.storage.createContext(
        {
          withCDN: config.withCDN,
          metadata: {
            source: "StreamVerse",
            contentType: "video",
            version: "1.0.0",
          },
          callbacks: {
            onProviderSelected: (provider) => {
              console.log(
                `Storage provider selected: ${provider.serviceProvider}`
              );
            },
            onDataSetResolved: (info) => {
              console.log(
                `Dataset ${info.isExisting ? "reused" : "created"}: ${
                  info.dataSetId
                }`
              );
            },
          },
        }
      );

      setSynapse(synapseInstance);
      setStorageContext(defaultStorageContext);
      setIsInitialized(true);

      console.log("Synapse SDK initialized successfully");
    } catch (err) {
      console.error("Failed to create Synapse instance:", err);
      setError(
        err instanceof Error ? err.message : "Failed to initialize Synapse SDK"
      );
      setSynapse(null);
      setStorageContext(null);
      setIsInitialized(false);
    } finally {
      setIsLoading(false);
    }
  }, [signer, isConnected, chainId]);

  const reconnect = useCallback(() => {
    createSynapse();
  }, [createSynapse]);

  useEffect(() => {
    createSynapse();
  }, [createSynapse]);

  // Cleanup WebSocket connections when component unmounts
  useEffect(() => {
    return () => {
      if (synapse) {
        const provider = synapse.getProvider();
        if (provider && typeof provider.destroy === "function") {
          provider.destroy();
        }
      }
    };
  }, [synapse]);

  return (
    <SynapseContext.Provider
      value={{
        synapse,
        storageContext,
        isLoading,
        error,
        reconnect,
        isInitialized,
      }}
    >
      {children}
    </SynapseContext.Provider>
  );
};

export const useSynapse = () => {
  const context = useContext(SynapseContext);
  if (!context) {
    throw new Error("useSynapse must be used within a SynapseProvider");
  }
  return context;
};
