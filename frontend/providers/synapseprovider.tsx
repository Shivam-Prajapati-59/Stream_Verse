"use client";

import { Synapse, WarmStorageService, RPC_URLS } from "@filoz/synapse-sdk";
import { createContext, useState, useEffect, useContext } from "react";
import { useEthersSigner } from "@/hooks/useEthers";
import { useAccount } from "wagmi";
import { config } from "@/config";

interface SynapseContextType {
  synapse: Synapse | null;
  warmStorageService: WarmStorageService | null;
  isLoading: boolean;
  error: string | null;
  reconnect: () => void;
}

export const SynapseContext = createContext<SynapseContextType>({
  synapse: null,
  warmStorageService: null,
  isLoading: false,
  error: null,
  reconnect: () => {},
});

export const SynapseProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [synapse, setSynapse] = useState<Synapse | null>(null);
  const [warmStorageService, setWarmStorageService] =
    useState<WarmStorageService | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signer = useEthersSigner();
  const { isConnected, chainId } = useAccount();

  const createSynapse = async () => {
    if (!signer || !isConnected) {
      setSynapse(null);
      setWarmStorageService(null);
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
        throw new Error(
          `Unsupported network. Please connect to Filecoin Mainnet (314) or Calibration (314159). Current chain ID: ${chainId}`
        );
      }

      const synapseInstance = await Synapse.create({
        signer,
        rpcURL,
        withCDN: config.withCDN,
        disableNonceManager: false,
      });

      const warmStorageAddress = await synapseInstance.getWarmStorageAddress();
      const warmStorageServiceInstance = await WarmStorageService.create(
        synapseInstance.getProvider(),
        warmStorageAddress
      );

      setSynapse(synapseInstance);
      setWarmStorageService(warmStorageServiceInstance);
    } catch (err) {
      console.error("Failed to create Synapse instance:", err);
      setError(
        err instanceof Error ? err.message : "Failed to initialize Synapse SDK"
      );
      setSynapse(null);
      setWarmStorageService(null);
    } finally {
      setIsLoading(false);
    }
  };

  const reconnect = () => {
    createSynapse();
  };

  useEffect(() => {
    createSynapse();
  }, [signer, isConnected, chainId]);

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
        warmStorageService,
        isLoading,
        error,
        reconnect,
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
