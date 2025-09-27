import { config } from "@/config";
import { Synapse, TIME_CONSTANTS, TOKENS } from "@filoz/synapse-sdk";
import { DATA_SET_CREATION_FEE, MAX_UINT256 } from "@/lib/utils";

/**
 * Performs a preflight check before file upload to ensure sufficient USDFC balance and allowances
 * for storage costs. This is a simplified version that ensures basic payment setup.
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
    updateStatus("💰 Checking payment setup...");

    // Get addresses
    const warmStorageAddress = await synapse.getWarmStorageAddress();
    const paymentsAddress = await synapse.getPaymentsAddress();

    // Check current allowance
    const currentAllowance = await synapse.payments.allowance(
      paymentsAddress,
      TOKENS.USDFC
    );

    // Basic deposit amount (simplified calculation based on file size)
    // This is a rough estimate - the actual costs will be calculated by the SDK during upload
    const estimatedCost =
      BigInt(Math.ceil(file.size / (1024 * 1024))) *
      BigInt("100000000000000000"); // ~0.1 USDFC per MB
    const requiredAmount =
      estimatedCost +
      (includeDataSetCreationFee ? DATA_SET_CREATION_FEE : BigInt(0));

    updateProgress(8);

    // Check wallet balance
    const walletBalance = await synapse.payments.walletBalance(TOKENS.USDFC);
    if (walletBalance < requiredAmount) {
      throw new Error(
        `Insufficient USDFC wallet balance. Required: ~${requiredAmount}, Available: ${walletBalance}`
      );
    }

    // Approve USDFC spending if needed
    if (currentAllowance < MAX_UINT256 / BigInt(2)) {
      updateStatus("💰 Approving USDFC spending...");
      const approveTx = await synapse.payments.approve(
        paymentsAddress,
        MAX_UINT256,
        TOKENS.USDFC
      );
      await approveTx.wait();
      updateStatus("💰 USDFC spending approved");
    }

    updateProgress(12);

    // Ensure we have some USDFC deposited in the payments contract
    const accountInfo = await synapse.payments.accountInfo();
    if (accountInfo.availableFunds < requiredAmount) {
      updateStatus("💰 Depositing USDFC to cover storage costs...");
      const depositTx = await synapse.payments.deposit(
        requiredAmount,
        TOKENS.USDFC
      );
      await depositTx.wait();
      updateStatus("💰 USDFC deposited successfully");
    }

    updateProgress(16);

    // Check service approval
    const serviceApproval = await synapse.payments.serviceApproval(
      warmStorageAddress,
      TOKENS.USDFC
    );
    if (
      !serviceApproval.isApproved ||
      serviceApproval.rateAllowance < estimatedCost
    ) {
      updateStatus(
        "💰 Approving Warm Storage service for automated payments..."
      );
      const serviceApproveTx = await synapse.payments.approveService(
        warmStorageAddress,
        estimatedCost * BigInt(10), // Rate allowance (10x the estimated cost for buffer)
        requiredAmount * BigInt(30), // Lockup allowance (30x for long-term storage)
        TIME_CONSTANTS.EPOCHS_PER_DAY * BigInt(config.persistencePeriod),
        TOKENS.USDFC
      );
      await serviceApproveTx.wait();
      updateStatus("💰 Warm Storage service approved for automated payments");
    }

    updateProgress(20);
    updateStatus("✅ Payment setup completed successfully");
  } catch (error) {
    console.error("Preflight check failed:", error);
    throw new Error(
      `Payment setup failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};
