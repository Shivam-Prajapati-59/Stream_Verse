import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { useSynapse } from "@/providers/synapseprovider";
import { toast } from "sonner";

/**
 * Simplified dataset operations using the current Synapse SDK
 */

/**
 * Hook to fetch user's datasets
 */
export const useUserDatasets = () => {
  const { synapse } = useSynapse();
  const { address } = useAccount();

  return useQuery({
    queryKey: ["user-datasets", address],
    queryFn: async () => {
      if (!synapse || !address) {
        throw new Error("Synapse SDK or address not available");
      }

      const datasets = await synapse.storage.findDataSets(address);
      return datasets;
    },
    enabled: !!synapse && !!address,
    staleTime: 30000, // 30 seconds
  });
};

/**
 * Hook to get storage information
 */
export const useStorageInfo = () => {
  const { synapse } = useSynapse();

  return useQuery({
    queryKey: ["storage-info"],
    queryFn: async () => {
      if (!synapse) {
        throw new Error("Synapse SDK not available");
      }

      const storageInfo = await synapse.getStorageInfo();
      return storageInfo;
    },
    enabled: !!synapse,
    staleTime: 60000, // 1 minute
  });
};

/**
 * Hook to create a new storage context
 */
export const useCreateStorageContext = () => {
  const { synapse } = useSynapse();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (options: {
      withCDN?: boolean;
      metadata?: Record<string, string>;
    }) => {
      if (!synapse) {
        throw new Error("Synapse SDK not available");
      }

      const context = await synapse.storage.createContext({
        withCDN: options.withCDN ?? true,
        metadata: options.metadata,
      });

      return context;
    },
    onSuccess: () => {
      toast.success("Storage context created successfully");
      // Invalidate datasets query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["user-datasets"] });
    },
    onError: (error: Error) => {
      console.error("Failed to create storage context:", error);
      toast.error(`Failed to create storage context: ${error.message}`);
    },
  });
};

/**
 * Hook to run preflight checks
 */
export const usePreflightCheck = () => {
  const { synapse } = useSynapse();

  return useMutation({
    mutationFn: async (params: { size: number; withCDN?: boolean }) => {
      if (!synapse) {
        throw new Error("Synapse SDK not available");
      }

      const preflightInfo = await synapse.storage.preflightUpload(params.size, {
        withCDN: params.withCDN ?? true,
      });

      return preflightInfo;
    },
    onError: (error: Error) => {
      console.error("Preflight check failed:", error);
      toast.error(`Preflight check failed: ${error.message}`);
    },
  });
};
