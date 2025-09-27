export interface BalanceData {
  filBalance: bigint;
  filBalanceFormatted: number;
  usdfcBalance: bigint;
  usdfcBalanceFormatted: number;
  warmStorageBalance: bigint;
  warmStorageBalanceFormatted: number;
  currentRateAllowanceGB: number;
  currentStorageGB: number;
  persistenceDaysLeft: number;
  persistenceDaysLeftAtCurrentRate: number;
  isRateSufficient: boolean;
  isLockupSufficient: boolean;
  isSufficient: boolean;
  depositNeeded: bigint;
  totalLockupNeeded: bigint;
  rateNeeded: bigint;
  currentLockupAllowance: bigint;
}

export interface AllowanceItemProps {
  label: string;
  isSufficient: boolean;
  isLoading: boolean;
}

export interface SectionProps {
  balances: BalanceData | undefined;
  isLoading: boolean;
}

export interface PaymentActionProps extends SectionProps {
  isProcessingPayment: boolean;
  onPayment: (params: {
    lockupAllowance: bigint;
    epochRateAllowance: bigint;
    depositAmount: bigint;
  }) => Promise<void>;
  handleRefetchBalances: () => Promise<void>;
  totalLockupNeeded?: bigint;
  depositNeeded?: bigint;
  rateNeeded?: bigint;
  currentLockupAllowance?: bigint;
}

// Enhanced dataset type with pieces and error handling
export interface EnhancedDataSetWithPieces {
  // Core dataset properties from EnhancedDataSetInfo (SDK)
  pdpVerifierDataSetId: number;
  railId: bigint; // This should be bigint to match SDK
  providerId: number;
  payee: string;
  isLive: boolean;
  isManaged: boolean;
  nextPieceId: number;
  currentPieceCount: number;
  withCDN: boolean;
  commissionBps: number;
  metadata: Record<string, string>;

  // Properties from DataSetInfo (base interface)
  pdpRailId: number;
  cacheMissRailId: number;
  cdnRailId: number;
  payer: string;
  serviceProvider: string;
  clientDataSetId: number;
  pdpEndEpoch: number;
  cdnEndEpoch: number;
  paymentEndEpoch?: number;

  // Piece metadata from the dataset
  pieceMetadata: Array<{
    pieceCid: string | any; // Can be string or CID object from Synapse SDK
    rawSize: number;
    uuid: string;
  }>;

  // Enhanced properties
  provider?: any; // ServiceProvider info from SDK
  serviceURL?: string;
  data?: {
    id: number;
    pieces: Array<{
      pieceId: number;
      pieceCid: string | any; // Can be string or CID object from Synapse SDK
      rawSize: number;
      uuid: string;
    }>;
    nextChallengeEpoch?: number;
  } | null;
  error?: string | null;
}

// Additional types for Synapse SDK compatibility
export interface WarmStorageBalance {
  costs: {
    perEpoch: bigint;
    perDay: bigint;
    perMonth: bigint;
  };
  currentRateUsed: bigint;
  currentRateAllowance: bigint;
  rateAllowanceNeeded: bigint;
  currentLockupAllowance: bigint;
  currentLockupUsed: bigint;
  lockupAllowanceNeeded: bigint;
  depositAmountNeeded: bigint;
}

export interface StorageCosts {
  perEpoch: bigint;
  perDay: bigint;
  perMonth: bigint;
}

// Synapse SDK Data Set and Provider Types
export interface DataSet {
  pdpVerifierDataSetId: number;
  railId: bigint;
  providerId: number;
  payee: string;
  isLive: boolean;
  isManaged: boolean;
  nextPieceId: number;
  provider?: any; // ServiceProvider info from SDK
  serviceURL?: string;
  data?: {
    id: number;
    pieces: Array<{
      pieceCid: string | any; // Can be string or CID object from Synapse SDK
      rawSize: number;
      uuid: string;
    }>;
  };
}

export interface PieceInfo {
  pieceCid: string | any; // Can be string or CID object from Synapse SDK
  rawSize: number;
  uuid: string;
  status?: {
    exists: boolean;
    dataSetLastProven?: string;
    dataSetNextProofDue?: string;
  };
}

export interface DataSetOperationResult {
  success: boolean;
  error?: string;
  transactionHash?: string;
  dataSetId?: number;
}

export interface DataSetCreateOptions {
  metadata?: Record<string, string>;
  withCDN?: boolean;
  providerAddress?: string;
}
