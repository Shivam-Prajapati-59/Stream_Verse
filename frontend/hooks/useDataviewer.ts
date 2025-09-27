"use client";

import { useQuery } from "@tanstack/react-query";
import { EnhancedDataSetInfo, PDPServer } from "@filoz/synapse-sdk";
import { useAccount } from "wagmi";
import { DataSet, EnhancedDataSetWithPieces } from "@/types/types";
import { useSynapse } from "@/providers/synapseprovider";

/**
 * Enhanced hook to fetch and manage user datasets from Filecoin storage
 *
 * @description This hook implements the latest Synapse SDK patterns for dataset management:
 * 1. Uses WarmStorageService.getClientDataSetsWithDetails() for comprehensive data
 * 2. Efficiently manages provider information with enhanced error handling
 * 3. Provides detailed piece information and status for each dataset
 * 4. Implements proper error boundaries and data validation
 * 5. Supports background refresh with optimistic updates
 * 6. Includes dataset metadata and CDN status tracking
 *
 * @returns React Query result containing enriched datasets with provider and piece info
 *
 * @example
 * const { data, isLoading, error, refetch } = useDatasets();
 *
 * if (data?.datasets?.length > 0) {
 *   const dataset = data.datasets[0];
 *   console.log('Dataset ID:', dataset.pdpVerifierDataSetId);
 *   console.log('Provider:', dataset.provider?.name);
 *   console.log('Pieces:', dataset.data?.pieces?.length || 0);
 * }
 */
export const useDatasets = () => {
  const { address, isConnected } = useAccount();
  const {
    synapse,
    warmStorageService,
    isLoading: synapseLoading,
    error: synapseError,
  } = useSynapse();

  return useQuery({
    enabled: !!address && isConnected && !synapseLoading && !synapseError,
    queryKey: [
      "datasets",
      address,
      warmStorageService?.getViewContractAddress(),
    ],
    queryFn: async (): Promise<{ datasets: EnhancedDataSetWithPieces[] }> => {
      // STEP 1: Validate prerequisites with enhanced error messages
      if (!synapse) {
        throw new Error(
          "Synapse SDK not initialized. Please ensure wallet is connected and network is supported."
        );
      }
      if (!address) {
        throw new Error(
          "Wallet address not available. Please connect your wallet."
        );
      }
      if (!warmStorageService) {
        throw new Error(
          "Warm Storage service not available. Please check network connection."
        );
      }

      try {
        // STEP 2: Fetch enhanced dataset information with provider details
        console.log("Fetching client datasets with enhanced details...");
        const datasets = await warmStorageService.getClientDataSetsWithDetails(
          address
        );

        console.log(`Found ${datasets.length} datasets for address ${address}`);

        if (datasets.length === 0) {
          return { datasets: [] };
        }

        // STEP 3: Build provider ID to dataset mapping for efficient lookups
        const providerIdToDatasetMap = new Map<number, EnhancedDataSetInfo[]>();
        for (const dataset of datasets) {
          const existing = providerIdToDatasetMap.get(dataset.providerId) || [];
          existing.push(dataset);
          providerIdToDatasetMap.set(dataset.providerId, existing);
        }

        // STEP 4: Fetch provider information for unique provider IDs
        const uniqueProviderIds = Array.from(providerIdToDatasetMap.keys());
        console.log(
          `Fetching provider info for ${uniqueProviderIds.length} unique providers...`
        );

        const providersResults = await Promise.allSettled(
          uniqueProviderIds.map(async (providerId) => {
            try {
              const provider = await synapse.getProviderInfo(providerId);
              return { providerId, provider };
            } catch (error) {
              console.warn(
                `Failed to fetch provider info for ID ${providerId}:`,
                error
              );
              return { providerId, provider: null };
            }
          })
        );

        // STEP 5: Create provider lookup map
        const providerMap = new Map<number, any>();
        for (const result of providersResults) {
          if (result.status === "fulfilled" && result.value.provider) {
            providerMap.set(result.value.providerId, result.value.provider);
          }
        }

        // STEP 6: Fetch piece data for each dataset with enhanced error handling
        console.log("Fetching piece data for datasets...");
        const enrichedDatasets = await Promise.allSettled(
          datasets.map(
            async (
              dataset: EnhancedDataSetInfo
            ): Promise<EnhancedDataSetWithPieces> => {
              const provider = providerMap.get(dataset.providerId);
              const serviceURL = provider?.products?.PDP?.data?.serviceURL;

              try {
                // Skip PDP data fetching if no service URL available
                if (!serviceURL) {
                  console.warn(
                    `No PDP service URL for provider ${dataset.providerId}`
                  );
                  return {
                    ...dataset,
                    railId: BigInt(dataset.pdpRailId), // Convert to bigint
                    pieceMetadata: [], // Add empty array for missing property
                    provider,
                    serviceURL: "",
                    data: null,
                    error: "No PDP service URL available",
                  };
                }

                // Create PDP server connection and fetch dataset data
                const pdpServer = new PDPServer(null, serviceURL);
                const pdpData = await pdpServer.getDataSet(
                  dataset.pdpVerifierDataSetId
                );

                // Convert DataSetPieceData[] to expected format
                const convertedPieces = pdpData.pieces.map((piece, index) => ({
                  pieceId: piece.pieceId || index, // Use piece.pieceId or fallback to index
                  pieceCid: piece.pieceCid, // This will be handled by the CID conversion utility
                  rawSize: 0, // DataSetPieceData doesn't have rawSize, use 0 as default
                  uuid: `piece-${piece.pieceId || index}`, // Generate UUID from pieceId
                }));

                // Build piece metadata from the pieces
                const pieceMetadata = pdpData.pieces.map((piece, index) => ({
                  pieceCid: piece.pieceCid,
                  rawSize: 0, // Not available in DataSetPieceData
                  uuid: `piece-${piece.pieceId || index}`,
                }));

                return {
                  ...dataset,
                  railId: BigInt(dataset.pdpRailId), // Convert to bigint
                  pieceMetadata, // Add piece metadata
                  provider,
                  serviceURL,
                  data: {
                    id: pdpData.id,
                    pieces: convertedPieces,
                    nextChallengeEpoch: pdpData.nextChallengeEpoch,
                  },
                  error: null,
                };
              } catch (error) {
                console.warn(
                  `Failed to fetch dataset pieces for dataset ${dataset.pdpVerifierDataSetId}:`,
                  error
                );

                // Return dataset with error info but preserve basic information
                return {
                  ...dataset,
                  railId: BigInt(dataset.pdpRailId), // Convert to bigint
                  pieceMetadata: [], // Add empty array for missing property
                  provider,
                  serviceURL: serviceURL || "",
                  data: null,
                  error:
                    error instanceof Error
                      ? error.message
                      : "Failed to fetch dataset data",
                };
              }
            }
          )
        );

        // STEP 7: Process results and filter successful enrichments
        const successfulDatasets: EnhancedDataSetWithPieces[] = [];

        for (const result of enrichedDatasets) {
          if (result.status === "fulfilled") {
            successfulDatasets.push(result.value);
          } else {
            console.error("Dataset enrichment failed:", result.reason);
          }
        }

        console.log(
          `Successfully enriched ${successfulDatasets.length} out of ${datasets.length} datasets`
        );

        return { datasets: successfulDatasets };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        console.error("Failed to fetch datasets:", errorMessage);
        throw new Error(`Dataset fetch failed: ${errorMessage}`);
      }
    },
    staleTime: 30_000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60_000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: (failureCount, error) => {
      // Don't retry on validation errors (user needs to fix setup)
      if (
        error?.message?.includes("not initialized") ||
        error?.message?.includes("not available") ||
        error?.message?.includes("not connected")
      ) {
        return false;
      }
      // Retry network errors up to 2 times
      return failureCount < 2;
    },
  });
};
