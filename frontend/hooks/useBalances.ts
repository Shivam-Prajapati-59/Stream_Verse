"use client";

import { useQuery } from "@tanstack/react-query";
import { useAccount, useBalance } from "wagmi";
import { useSynapse } from "@/providers/synapseprovider";
import { config } from "@/config";
import { formatUnits } from "viem";
import { BalanceData } from "@/types/types";
// TOKENS import removed as walletBalance() now defaults to USDFC

export function useBalances() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { synapse } = useSynapse();

  return useQuery({
    queryKey: ["balances", address],
    queryFn: async (): Promise<BalanceData> => {
      if (!synapse || !address) {
        throw new Error("Missing required dependencies");
      }

      const [
        accountInfo,
        walletBalanceUSDFC,
        dataSets,
        railsAsPayer,
        railsAsPayee,
      ] = await Promise.all([
        synapse.payments.accountInfo(),
        synapse.payments.walletBalance(),
        synapse.storage.findDataSets(address),
        synapse.payments.getRailsAsPayer(),
        synapse.payments.getRailsAsPayee(),
      ]);

      // Get actual balances - use wagmi balance for FIL, not synapse
      const filBalance = balance?.value || BigInt(0);
      const usdfcBalance = walletBalanceUSDFC; // Actual wallet USDFC balance
      const warmStorageBalance = BigInt(accountInfo.availableFunds.toString()); // Warm storage deposited balance

      // Calculate storage metrics
      const currentStorageGB = dataSets?.length
        ? dataSets.reduce(
            (sum: number, ds: any) => sum + (ds.pieceMetadata?.length || 0),
            0
          ) * 0.1
        : 0;

      const currentRateAllowanceGB = config.storageCapacity;

      // Calculate persistence days
      const usdfcBalanceFormatted = Number(formatUnits(usdfcBalance, 18));
      const warmStorageBalanceFormatted = Number(
        formatUnits(warmStorageBalance, 18)
      );
      const persistenceDaysLeft =
        currentRateAllowanceGB > 0
          ? (warmStorageBalanceFormatted / currentRateAllowanceGB) * 30
          : 0;

      const persistenceDaysLeftAtCurrentRate =
        currentStorageGB > 0
          ? (warmStorageBalanceFormatted / currentStorageGB) * 30
          : 999999;

      // Calculate sufficiency based on warm storage balance (deposited funds)
      const isRateSufficient = currentRateAllowanceGB >= config.storageCapacity;
      const isLockupSufficient = persistenceDaysLeft >= config.minDaysThreshold;
      const isSufficient = isRateSufficient && isLockupSufficient;

      // Calculate needed amounts (simplified) - based on warm storage balance
      const depositNeeded = isLockupSufficient
        ? BigInt(0)
        : BigInt(
            Math.ceil(
              (config.minDaysThreshold - persistenceDaysLeft) *
                config.storageCapacity
            ) * 1e18
          );
      const totalLockupNeeded = BigInt(
        config.persistencePeriod * config.storageCapacity * 1e18
      );
      const rateNeeded = BigInt(config.storageCapacity * 1e18);
      const currentLockupAllowance = warmStorageBalance; // Use warm storage balance for lockup calculations

      return {
        filBalance,
        filBalanceFormatted: Number(formatUnits(filBalance, 18)),
        usdfcBalance,
        usdfcBalanceFormatted,
        warmStorageBalance,
        warmStorageBalanceFormatted,
        currentRateAllowanceGB,
        currentStorageGB,
        persistenceDaysLeft,
        persistenceDaysLeftAtCurrentRate,
        isRateSufficient,
        isLockupSufficient,
        isSufficient,
        depositNeeded,
        totalLockupNeeded,
        rateNeeded,
        currentLockupAllowance,
      };
    },
    enabled: !!synapse && !!address && isConnected,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}
