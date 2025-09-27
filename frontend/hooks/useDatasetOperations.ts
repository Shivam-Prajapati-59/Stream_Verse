// hooks/useDatasetOperations.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSynapse } from "@/providers/synapseprovider";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { useEthersSigner } from "@/hooks/useEthers";

/**
 * Hook for terminating a dataset
 */
export const useTerminateDataset = () => {
  const { warmStorageService } = useSynapse();
  const { address } = useAccount();
  const signer = useEthersSigner();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ datasetId }: { datasetId: string | number }) => {
      if (!warmStorageService) {
        throw new Error("Warm Storage service not available");
      }
      if (!signer) {
        throw new Error("Signer not available");
      }

      // Use WarmStorageService to terminate dataset
      const result = await warmStorageService.terminateDataSet(
        signer,
        Number(datasetId)
      );

      return result;
    },
    onSuccess: (_, variables) => {
      toast.success(`Dataset ${variables.datasetId} terminated successfully`);

      // Invalidate and refetch datasets
      queryClient.invalidateQueries({
        queryKey: ["datasets", address],
      });
    },
    onError: (error: Error, variables) => {
      console.error("Dataset termination failed:", error);
      toast.error(
        `Failed to terminate dataset ${variables.datasetId}: ${error.message}`
      );
    },
  });
};

/**
 * Hook for getting detailed dataset information
 */
export const useDatasetDetails = (datasetId: string | number) => {
  const { warmStorageService } = useSynapse();

  return useQuery({
    queryKey: ["dataset-details", datasetId],
    queryFn: async () => {
      if (!warmStorageService) {
        throw new Error("Warm Storage service not available");
      }

      try {
        // Get detailed dataset information
        const details = await warmStorageService.getDataSet(Number(datasetId));
        return details;
      } catch (error) {
        console.error("Failed to fetch dataset details:", error);
        throw error;
      }
    },
    enabled: !!warmStorageService && !!datasetId,
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000, // Consider data stale after 30 seconds
  });
};

/**
 * Hook for getting dataset metadata
 */
export const useDatasetMetadata = (datasetId: string | number) => {
  const { warmStorageService } = useSynapse();

  return useQuery({
    queryKey: ["dataset-metadata", datasetId],
    queryFn: async () => {
      if (!warmStorageService) {
        throw new Error("Warm Storage service not available");
      }

      try {
        // Get dataset metadata
        const metadata = await warmStorageService.getDataSetMetadata(
          Number(datasetId)
        );
        return metadata;
      } catch (error) {
        console.error("Failed to fetch dataset metadata:", error);
        throw error;
      }
    },
    enabled: !!warmStorageService && !!datasetId,
    staleTime: 300000, // Metadata is relatively static, cache for 5 minutes
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook for getting piece metadata
 */
export const usePieceMetadata = (
  datasetId: string | number,
  pieceId: string | number
) => {
  const { warmStorageService } = useSynapse();

  return useQuery({
    queryKey: ["piece-metadata", datasetId, pieceId],
    queryFn: async () => {
      if (!warmStorageService) {
        throw new Error("Warm Storage service not available");
      }

      try {
        // Get piece metadata
        const metadata = await warmStorageService.getPieceMetadata(
          Number(datasetId),
          Number(pieceId)
        );
        return metadata;
      } catch (error) {
        console.error("Failed to fetch piece metadata:", error);
        throw error;
      }
    },
    enabled: !!warmStorageService && !!datasetId && !!pieceId,
    staleTime: 300000, // Piece metadata is static, cache for 5 minutes
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook for getting storage cost calculations
 */
export const useStorageCost = (sizeInBytes?: number) => {
  const { warmStorageService } = useSynapse();

  return useQuery({
    queryKey: ["storage-cost", sizeInBytes],
    queryFn: async () => {
      if (!warmStorageService || !sizeInBytes) {
        throw new Error("Storage service or size not available");
      }

      try {
        // Calculate storage costs
        const costs = await warmStorageService.calculateStorageCost(
          sizeInBytes
        );
        return costs;
      } catch (error) {
        console.error("Failed to calculate storage cost:", error);
        throw error;
      }
    },
    enabled: !!warmStorageService && !!sizeInBytes && sizeInBytes > 0,
    staleTime: 600000, // Cost calculations can be cached for 10 minutes
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook for getting approved providers using ProviderResolver
 */
export const useApprovedProviders = () => {
  const { warmStorageService } = useSynapse();

  return useQuery({
    queryKey: ["approved-providers"],
    queryFn: async () => {
      if (!warmStorageService) {
        throw new Error("Warm Storage service not available");
      }

      try {
        // Get approved provider IDs from WarmStorageService
        const providerIds = await warmStorageService.getApprovedProviderIds();
        return providerIds.map((id: number, index: number) => ({
          id,
          index,
          name: `Provider ${id}`,
        }));
      } catch (error) {
        console.error("Failed to fetch approved providers:", error);
        throw error;
      }
    },
    enabled: !!warmStorageService,
    staleTime: 300000, // Provider list is relatively static, cache for 5 minutes
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook for checking if a provider is approved
 */
export const useProviderApprovalStatus = (providerId?: number) => {
  const { warmStorageService } = useSynapse();

  return useQuery({
    queryKey: ["provider-approval", providerId],
    queryFn: async () => {
      if (!warmStorageService || providerId === undefined) {
        throw new Error("Storage service or provider ID not available");
      }

      try {
        // Check if provider is approved using provider address method
        // We need to get provider address first from provider ID
        const providerIds = await warmStorageService.getApprovedProviderIds();
        const isApproved = providerIds.includes(providerId);
        return isApproved;
      } catch (error) {
        console.error("Failed to check provider approval:", error);
        throw error;
      }
    },
    enabled: !!warmStorageService && providerId !== undefined,
    staleTime: 180000, // Cache for 3 minutes
  });
};

/**
 * Hook for adding a provider to approved list (owner only)
 */
export const useAddApprovedProvider = () => {
  const { warmStorageService } = useSynapse();
  const signer = useEthersSigner();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ providerId }: { providerId: number }) => {
      if (!warmStorageService) {
        throw new Error("Warm Storage service not available");
      }
      if (!signer) {
        throw new Error("Signer not available");
      }

      // Add provider to approved list
      const result = await warmStorageService.addApprovedProvider(
        signer,
        providerId
      );
      return result;
    },
    onSuccess: (_, variables) => {
      toast.success(`Provider ${variables.providerId} added to approved list`);

      // Invalidate approved providers query
      queryClient.invalidateQueries({
        queryKey: ["approved-providers"],
      });
      queryClient.invalidateQueries({
        queryKey: ["provider-approval", variables.providerId],
      });
    },
    onError: (error: Error, variables) => {
      console.error("Failed to add approved provider:", error);
      toast.error(
        `Failed to add provider ${variables.providerId}: ${error.message}`
      );
    },
  });
};

/**
 * Hook for getting dataset piece addition info
 */
export const useAddPiecesInfo = (datasetId?: number) => {
  const { warmStorageService } = useSynapse();

  return useQuery({
    queryKey: ["add-pieces-info", datasetId],
    queryFn: async () => {
      if (!warmStorageService || datasetId === undefined) {
        throw new Error("Storage service or dataset ID not available");
      }

      try {
        // Get add pieces info for dataset
        const info = await warmStorageService.getAddPiecesInfo(datasetId);
        return info;
      } catch (error) {
        console.error("Failed to fetch add pieces info:", error);
        throw error;
      }
    },
    enabled: !!warmStorageService && datasetId !== undefined,
    staleTime: 60000, // Cache for 1 minute
  });
};

/**
 * Hook for bulk operations on multiple datasets
 */
export const useBulkDatasetOperations = () => {
  const { warmStorageService } = useSynapse();
  const { address } = useAccount();
  const signer = useEthersSigner();
  const queryClient = useQueryClient();

  const terminateMultiple = useMutation({
    mutationFn: async ({ datasetIds }: { datasetIds: number[] }) => {
      if (!warmStorageService) {
        throw new Error("Warm Storage service not available");
      }
      if (!signer) {
        throw new Error("Signer not available");
      }

      // Terminate multiple datasets
      const results = await Promise.allSettled(
        datasetIds.map((id) => warmStorageService.terminateDataSet(signer, id))
      );

      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      return { successful, failed, results };
    },
    onSuccess: (result) => {
      toast.success(
        `Bulk termination completed: ${result.successful} successful, ${result.failed} failed`
      );

      // Invalidate datasets query
      queryClient.invalidateQueries({
        queryKey: ["datasets", address],
      });
    },
    onError: (error: Error) => {
      console.error("Bulk termination failed:", error);
      toast.error(`Bulk termination failed: ${error.message}`);
    },
  });

  return {
    terminateMultiple,
  };
};

/**
 * Hook for checking dataset creation status from transaction
 */
export const useDatasetCreationStatus = (txHash?: string) => {
  const { warmStorageService } = useSynapse();

  return useQuery({
    queryKey: ["dataset-creation-status", txHash],
    queryFn: async () => {
      if (!warmStorageService || !txHash) {
        throw new Error("Storage service or transaction hash not available");
      }

      try {
        // Get comprehensive dataset creation status from transaction hash
        const status = await warmStorageService.getComprehensiveDataSetStatus(
          txHash
        );
        return status;
      } catch (error) {
        console.error("Failed to fetch dataset creation status:", error);
        throw error;
      }
    },
    enabled: !!warmStorageService && !!txHash,
    refetchInterval: 5000, // Check creation status frequently
    staleTime: 1000, // Consider data stale quickly during creation
  });
};

/**
 * Hook for getting service pricing information
 */
export const useServicePrice = () => {
  const { warmStorageService } = useSynapse();

  return useQuery({
    queryKey: ["service-price"],
    queryFn: async () => {
      if (!warmStorageService) {
        throw new Error("Warm Storage service not available");
      }

      try {
        // Get current service pricing
        const priceInfo = await warmStorageService.getServicePrice();
        return priceInfo;
      } catch (error) {
        console.error("Failed to fetch service price:", error);
        throw error;
      }
    },
    enabled: !!warmStorageService,
    staleTime: 600000, // Pricing is relatively stable, cache for 10 minutes
    refetchOnWindowFocus: false,
  });
};
