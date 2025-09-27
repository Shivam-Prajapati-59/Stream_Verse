import { config } from "@/config";
import { Synapse, TIME_CONSTANTS, TOKENS } from "@filoz/synapse-sdk";
import { DATA_SET_CREATION_FEE, MAX_UINT256 } from "@/lib/utils";
import { ethers } from "ethers";

/**
 * Performs comprehensive preflight checks before file upload to ensure sufficient USDFC balance
 * and allowances for storage costs. Handles automated payment setup and validation.
 *
 * @param file - The file to be uploaded
 * @param synapse - Synapse SDK instance
 * @param includeDataSetCreationFee - Whether to include data set creation fee
 * @param updateStatus - Callback to update status messages
 * @param updateProgress - Callback to update progress percentage
 */
export const preflightCheck = async (
  file: File,
  synapse: Synapse,
  includeDataSetCreationFee: boolean,
  updateStatus: (status: string) => void,
  updateProgress: (progress: number) => void
) => {
  try {
    updateStatus("???? Initializing payment setup...");
    updateProgress(6);

    // Get required addresses
    const warmStorageAddress = await synapse.getWarmStorageAddress();
    const paymentsAddress = await synapse.getPaymentsAddress();

    updateStatus("???? Checking current allowances...");
    updateProgress(8);

    // Check current allowance for payments contract
    const currentAllowance = await synapse.payments.allowance(paymentsAddress);

    // Enhanced cost estimation based on file size and network conditions
    const fileSizeInGB = file.size / (1024 * 1024 * 1024);
    const baseCostPerGB = ethers.parseUnits("0.05", 18); // 0.05 USDFC per GB
    const estimatedStorageCost =
      (BigInt(Math.ceil(fileSizeInGB * 1000)) * baseCostPerGB) / BigInt(1000);

    // Add buffer for network fees and fluctuations (50% buffer)
    const bufferMultiplier = BigInt(150); // 150% of estimated cost
    const bufferedCost =
      (estimatedStorageCost * bufferMultiplier) / BigInt(100);

    const requiredAmount =
      bufferedCost +
      (includeDataSetCreationFee ? DATA_SET_CREATION_FEE : BigInt(0));

    updateStatus("???? Validating wallet balance...");
    updateProgress(10);

    // Check wallet balance
    const walletBalance = await synapse.payments.walletBalance(TOKENS.USDFC);
    console.log(
      `Wallet balance: ${ethers.formatUnits(walletBalance, 18)} USDFC`
    );
    console.log(
      `Required amount: ${ethers.formatUnits(requiredAmount, 18)} USDFC`
    );

    if (walletBalance < requiredAmount) {
      const shortfall = requiredAmount - walletBalance;
      throw new Error(
        `Insufficient USDFC wallet balance. Need ${ethers.formatUnits(
          shortfall,
          18
        )} more USDFC. ` +
          `Required: ${ethers.formatUnits(
            requiredAmount,
            18
          )}, Available: ${ethers.formatUnits(walletBalance, 18)}`
      );
    }

    // Check and approve USDFC spending if needed
    const minAllowance = MAX_UINT256 / BigInt(4); // Use 1/4 of max uint256 as threshold
    if (currentAllowance < minAllowance) {
      updateStatus("???? Approving USDFC spending for payments contract...");
      updateProgress(12);

      try {
        const approveTx = await synapse.payments.approve(
          paymentsAddress,
          MAX_UINT256
        );
        updateStatus("???? Waiting for approval confirmation...");
        await approveTx.wait();
        updateStatus("??? USDFC spending approved");
      } catch (error) {
        console.error("Approval failed:", error);
        throw new Error(
          `Failed to approve USDFC spending: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }

    updateProgress(14);

    // Check payments contract balance and deposit if needed
    updateStatus("???? Checking payments contract balance...");
    const accountInfo = await synapse.payments.accountInfo();
    console.log(
      `Available funds in payments contract: ${ethers.formatUnits(
        accountInfo.availableFunds,
        18
      )} USDFC`
    );

    if (accountInfo.availableFunds < requiredAmount) {
      const depositAmount =
        requiredAmount -
        accountInfo.availableFunds +
        ethers.parseUnits("10", 18); // Extra 10 USDFC buffer
      updateStatus(
        `???? Depositing ${ethers.formatUnits(
          depositAmount,
          18
        )} USDFC to payments contract...`
      );
      updateProgress(16);

      try {
        const depositTx = await synapse.payments.deposit(depositAmount);
        updateStatus("???? Waiting for deposit confirmation...");
        await depositTx.wait();
        updateStatus("??? USDFC deposited successfully");
      } catch (error) {
        console.error("Deposit failed:", error);
        throw new Error(
          `Failed to deposit USDFC: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }

    updateProgress(18);

    // Check and setup service approval for Warm Storage
    updateStatus("???? Checking Warm Storage service approval...");
    const serviceApproval = await synapse.payments.serviceApproval(
      warmStorageAddress
    );

    const minRateAllowance = estimatedStorageCost * BigInt(20); // 20x buffer for rate allowance
    const minLockupAllowance = requiredAmount * BigInt(50); // 50x buffer for lockup allowance
    const maxLockupPeriod =
      TIME_CONSTANTS.EPOCHS_PER_DAY * BigInt(config.persistencePeriod || 30); // Default 30 days

    if (
      !serviceApproval.isApproved ||
      serviceApproval.rateAllowance < minRateAllowance ||
      serviceApproval.lockupAllowance < minLockupAllowance
    ) {
      updateStatus(
        "???? Approving Warm Storage service for automated payments..."
      );
      updateProgress(20);

      try {
        const serviceApproveTx = await synapse.payments.approveService(
          warmStorageAddress,
          minRateAllowance, // Rate allowance with generous buffer
          minLockupAllowance, // Lockup allowance with generous buffer
          maxLockupPeriod // Max lockup period
        );

        updateStatus("???? Waiting for service approval confirmation...");
        await serviceApproveTx.wait();
        updateStatus(
          "??? Warm Storage service approved for automated payments"
        );
      } catch (error) {
        console.error("Service approval failed:", error);
        throw new Error(
          `Failed to approve Warm Storage service: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }

    updateProgress(22);
    updateStatus("??? Payment setup completed successfully");

    // Log final status for debugging
    const finalAccountInfo = await synapse.payments.accountInfo();
    const finalServiceApproval = await synapse.payments.serviceApproval(
      warmStorageAddress
    );

    console.log("Preflight check completed:", {
      availableFunds: ethers.formatUnits(finalAccountInfo.availableFunds, 18),
      requiredAmount: ethers.formatUnits(requiredAmount, 18),
      serviceApproved: finalServiceApproval.isApproved,
      rateAllowance: ethers.formatUnits(finalServiceApproval.rateAllowance, 18),
      lockupAllowance: ethers.formatUnits(
        finalServiceApproval.lockupAllowance,
        18
      ),
    });
  } catch (error) {
    console.error("Preflight check failed:", error);
    throw new Error(
      `Payment setup failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};
