"use client";
import React from "react";
import { useAccount } from "wagmi";
import { useBalances } from "@/hooks/useBalances";
import { usePayment } from "@/hooks/usePayment";
import { config } from "@/config";
import { formatUnits } from "viem";
import { PaymentActionProps } from "@/types/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfettiDisplay } from "@/components/ui/confetti";
import { Progress } from "@/components/ui/progress";
import {
  Wallet,
  Database,
  AlertCircle,
  CheckCircle2,
  FileText,
  CreditCard,
  Clock,
  Settings,
  ExternalLink,
  Zap,
} from "lucide-react";

// Fully Responsive Compact Stat Card Component
interface StatCardProps {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  progress?: number;
}

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  progress,
}: StatCardProps) => {
  return (
    <Card className="h-20 sm:h-20 md:h-20 transition-all duration-200 hover:shadow-sm">
      <CardContent className="p-2 sm:p-3 h-full flex items-center">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 sm:gap-2 mb-1">
            {Icon && (
              <Icon className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            )}
            <span className="text-xs text-muted-foreground truncate font-medium">
              {title}
            </span>
          </div>
          <div className="text-xs sm:text-sm font-semibold truncate text-foreground">
            {value}
          </div>
          {subtitle && (
            <div className="text-xs text-muted-foreground truncate hidden sm:block">
              {subtitle}
            </div>
          )}
          {progress !== undefined && (
            <Progress value={progress} className="h-1 mt-1" />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Responsive Loading Skeleton
const LoadingSkeleton = () => (
  <div className="space-y-3 sm:space-y-4">
    <div className="grid gap-2 sm:gap-3 grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="h-20">
          <CardContent className="p-2 sm:p-3">
            <div className="flex items-center gap-1 sm:gap-2 mb-2">
              <Skeleton className="h-3 w-3 rounded" />
              <Skeleton className="h-3 w-12 sm:w-16" />
            </div>
            <Skeleton className="h-4 w-16 sm:w-20 mb-1" />
            <Skeleton className="h-3 w-8 sm:w-12" />
          </CardContent>
        </Card>
      ))}
    </div>
    <div className="grid gap-2 sm:gap-3 grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={`second-${i}`} className="h-20">
          <CardContent className="p-2 sm:p-3">
            <div className="flex items-center gap-1 sm:gap-2 mb-2">
              <Skeleton className="h-3 w-3 rounded" />
              <Skeleton className="h-3 w-12 sm:w-16" />
            </div>
            <Skeleton className="h-4 w-16 sm:w-20 mb-1" />
            <Skeleton className="h-3 w-8 sm:w-12" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

// Fully Responsive Header
const StorageBalanceHeader = ({ chainId }: { chainId?: number }) => (
  <Card className="bg-gradient-to-r from-background via-muted/30 to-background border-border/50">
    <CardContent className="p-3 sm:p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 border border-primary/20">
            <Database className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-base sm:text-lg font-semibold tracking-tight truncate">
              Storage Balance
            </h1>
            <p className="text-xs text-muted-foreground truncate">
              Manage USDFC deposits for storage
            </p>
          </div>
        </div>
        {chainId === 314159 && (
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2 sm:px-3 gap-1 text-xs hover:bg-primary/5 flex-1 sm:flex-none"
              onClick={() =>
                window.open(
                  "https://forest-explorer.chainsafe.dev/faucet/calibnet_usdfc",
                  "_blank"
                )
              }
            >
              <Zap className="h-3 w-3" />
              <span className="hidden xs:inline">Get </span>USDFC
              <ExternalLink className="h-2 w-2" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2 sm:px-3 gap-1 text-xs hover:bg-primary/5 flex-1 sm:flex-none"
              onClick={() =>
                window.open(
                  "https://faucet.calibnet.chainsafe-fil.io/funds.html",
                  "_blank"
                )
              }
            >
              <Wallet className="h-3 w-3" />
              <span className="hidden xs:inline">Get </span>FIL
              <ExternalLink className="h-2 w-2" />
            </Button>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

// Enhanced Compact Action Section with better UX
const ActionSection = ({
  balances,
  isLoading,
  isProcessingPayment,
  onPayment,
  handleRefetchBalances,
}: PaymentActionProps) => {
  if (isLoading || !balances) return null;

  if (balances.isSufficient) {
    return (
      <Alert className="bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800">
        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
        <AlertDescription className="text-green-800 dark:text-green-300 text-sm">
          Storage balance is sufficient for {config.storageCapacity} GB storage
          with {balances.persistenceDaysLeft.toFixed(1)} days of coverage
          remaining.
        </AlertDescription>
      </Alert>
    );
  }

  const depositNeeded = Number(
    formatUnits(balances?.depositNeeded ?? BigInt(0), 18)
  ).toFixed(3);
  const hasEnoughFIL = balances.filBalance > BigInt(0);
  const hasEnoughUSDFC =
    balances.usdfcBalance >= (balances.depositNeeded ?? BigInt(0));

  // Critical error states
  if (
    !hasEnoughFIL ||
    (!hasEnoughUSDFC &&
      balances.usdfcBalance === BigInt(0) &&
      balances.warmStorageBalance === BigInt(0))
  ) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-sm space-y-2">
          <div className="font-medium">Action Required:</div>
          <div className="space-y-1">
            {!hasEnoughFIL && <div>• Get FIL tokens for transaction fees</div>}
            {!hasEnoughUSDFC &&
              balances.depositNeeded &&
              balances.depositNeeded > BigInt(0) && (
                <div>• Need {depositNeeded} more USDFC tokens to deposit</div>
              )}
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  const handleAction = async () => {
    try {
      await onPayment({
        lockupAllowance: balances.totalLockupNeeded,
        epochRateAllowance: balances.rateNeeded,
        depositAmount: balances.depositNeeded,
      });
      await handleRefetchBalances();
    } catch (error) {
      console.error("Payment action failed:", error);
    }
  };

  const getActionMessage = () => {
    if (!balances.isRateSufficient && !balances.isLockupSufficient) {
      return `Deposit ${depositNeeded} USDFC and increase rate allowance to fix storage configuration`;
    } else if (!balances.isLockupSufficient) {
      return `Deposit ${depositNeeded} USDFC to extend storage persistence period`;
    } else {
      return "Increase rate allowance to meet storage capacity requirements";
    }
  };

  return (
    <div className="space-y-3">
      <Alert className="bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800">
        <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
        <AlertDescription className="text-yellow-800 dark:text-yellow-300 text-sm">
          <div className="font-medium mb-1">Storage Configuration Needed</div>
          <div>{getActionMessage()}</div>
        </AlertDescription>
      </Alert>
      <Button
        onClick={handleAction}
        disabled={isProcessingPayment}
        size="sm"
        className="w-full relative"
      >
        {isProcessingPayment ? (
          <>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-4 w-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
            </div>
            <span className="opacity-0">Processing...</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Fix Storage Balance
          </>
        )}
      </Button>
    </div>
  );
};

// Responsive Overview Tab
const OverviewTab = (props: PaymentActionProps) => {
  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Wallet Balances Row - Responsive Grid */}
      <div className="grid gap-2 sm:gap-3 grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <StatCard
          title="FIL Balance"
          value={
            props.isLoading
              ? "..."
              : `${props.balances?.filBalanceFormatted?.toFixed(2) || 0} FIL`
          }
          subtitle="Network fees"
          icon={Wallet}
        />
        <StatCard
          title="USDFC Wallet"
          value={
            props.isLoading
              ? "..."
              : `${
                  props.balances?.usdfcBalanceFormatted?.toFixed(3) || 0
                } USDFC`
          }
          subtitle="Available to deposit"
          icon={CreditCard}
        />
        <StatCard
          title="USDFC Deposited"
          value={
            props.isLoading
              ? "..."
              : `${
                  props.balances?.warmStorageBalanceFormatted?.toFixed(3) || 0
                } USDFC`
          }
          subtitle="Active for storage"
          icon={Database}
        />
        <StatCard
          title="Storage Allowance"
          value={
            props.isLoading
              ? "..."
              : `${
                  props.balances?.currentRateAllowanceGB?.toLocaleString() || 0
                } GB`
          }
          subtitle={`of ${config.storageCapacity} GB configured`}
          icon={Database}
          progress={
            props.balances?.currentRateAllowanceGB
              ? Math.min(
                  (props.balances.currentRateAllowanceGB /
                    config.storageCapacity) *
                    100,
                  100
                )
              : 0
          }
        />
      </div>

      {/* Storage Status & Analytics Row - Responsive Grid */}
      <div className="grid gap-2 sm:gap-3 grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <StatCard
          title="Storage Used"
          value={
            props.isLoading
              ? "..."
              : `${props.balances?.currentStorageGB?.toFixed(1) || 0} GB`
          }
          subtitle={`${(
            ((props.balances?.currentStorageGB || 0) /
              (props.balances?.currentRateAllowanceGB || 1)) *
            100
          ).toFixed(1)}% of allowance`}
          icon={Database}
          progress={
            props.balances?.currentRateAllowanceGB
              ? Math.min(
                  ((props.balances.currentStorageGB || 0) /
                    props.balances.currentRateAllowanceGB) *
                    100,
                  100
                )
              : 0
          }
        />
        <StatCard
          title="Persistence Coverage"
          value={
            props.isLoading
              ? "..."
              : `${props.balances?.persistenceDaysLeft?.toFixed(1) || 0} days`
          }
          subtitle={`At max rate usage`}
          icon={Clock}
        />
        <StatCard
          title="Rate Allowance"
          value={
            <Badge
              variant={
                props.balances?.isRateSufficient ? "default" : "destructive"
              }
              className="text-xs font-medium"
            >
              {props.isLoading
                ? "..."
                : props.balances?.isRateSufficient
                ? "✓ Sufficient"
                : "⚠ Insufficient"}
            </Badge>
          }
          subtitle="Storage rate status"
          icon={CheckCircle2}
        />
        <StatCard
          title="Lockup Allowance"
          value={
            <Badge
              variant={
                props.balances?.isLockupSufficient ? "default" : "destructive"
              }
              className="text-xs font-medium"
            >
              {props.isLoading
                ? "..."
                : props.balances?.isLockupSufficient
                ? "✓ Sufficient"
                : "⚠ Insufficient"}
            </Badge>
          }
          subtitle="Deposit lockup status"
          icon={Clock}
        />
      </div>

      <ActionSection {...props} />
    </div>
  );
};

// Enhanced Responsive Data Sets Tab
const DataSetsTab = () => (
  <Card className="border-dashed border-2 border-muted-foreground/20">
    <CardContent className="p-3 sm:p-4">
      {" "}
      {/* reduced padding */}
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="p-2 sm:p-3 rounded-full bg-muted/30 border border-muted-foreground/20">
          <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
        </div>
        <div className="space-y-1 max-w-md">
          {" "}
          {/* tighter spacing */}
          <h3 className="font-semibold text-sm sm:text-base">
            Data Sets Management
          </h3>
          <p className="text-xs text-muted-foreground">
            Upload, organize, and monitor your files stored on the decentralized
            network. Track storage usage, file status, and manage data retention
            policies.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            className="gap-1 w-full sm:w-auto"
          >
            <FileText className="h-4 w-4" />
            Coming Soon
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-muted-foreground w-full sm:w-auto"
          >
            <Settings className="h-4 w-4" />
            Configure Storage
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Enhanced Compact Configuration Tab
const ConfigurationTab = () => (
  <div className="space-y-4">
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Settings className="h-4 w-4 text-primary" />
          Storage Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid gap-2 sm:gap-3 grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <StatCard
            title="Storage Capacity"
            value={`${config.storageCapacity} GB`}
            subtitle="Maximum configured"
            icon={Database}
          />
          <StatCard
            title="Persistence Period"
            value={`${config.persistencePeriod} days`}
            subtitle="Data retention target"
            icon={Clock}
          />
          <StatCard
            title="Warning Threshold"
            value={`${config.minDaysThreshold} days`}
            subtitle="Alert trigger level"
            icon={AlertCircle}
          />
          <StatCard
            title="CDN Delivery"
            value={
              <Badge
                variant={config.withCDN ? "default" : "secondary"}
                className="text-xs font-medium"
              >
                {config.withCDN ? "✓ Enabled" : "✗ Disabled"}
              </Badge>
            }
            subtitle="Content acceleration"
            icon={Zap}
          />
        </div>
      </CardContent>
    </Card>

    <Card className="bg-muted/20">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex-shrink-0">
            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="space-y-1 min-w-0 flex-1">
            <h4 className="text-sm font-medium">Configuration Notes</h4>
            <p className="text-xs sm:text-sm text-muted-foreground">
              These settings define your storage requirements and system
              behavior. Adjust storage capacity and persistence period based on
              your application needs. Warning thresholds help maintain
              continuous service availability.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Main Component
const StorageBalance = () => {
  const { isConnected, chainId } = useAccount();
  const {
    data: balances,
    isLoading: isBalanceLoading,
    refetch: refetchBalances,
  } = useBalances();
  const { mutation: paymentMutation, status } = usePayment();
  const { mutateAsync: handlePayment, isPending: isProcessingPayment } =
    paymentMutation;

  const handleRefetchBalances = async () => {
    await refetchBalances();
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto p-2 sm:p-3 md:p-4 max-w-7xl">
        <Card>
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col items-center text-center space-y-3">
              <Wallet className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
              <div className="space-y-1">
                <h3 className="font-medium text-sm sm:text-base">
                  Wallet Not Connected
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Connect your wallet to view storage information
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-2 sm:p-3 md:p-4 max-w-7xl space-y-3 sm:space-y-4">
      <ConfettiDisplay />
      <StorageBalanceHeader chainId={chainId} />

      {status && (
        <Alert variant={status.includes("❌") ? "destructive" : "default"}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">{status}</AlertDescription>
        </Alert>
      )}

      {isBalanceLoading && !balances ? (
        <LoadingSkeleton />
      ) : (
        <Tabs defaultValue="overview" className="space-y-3 sm:space-y-4">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto sm:mx-0 h-9 sm:h-10 bg-muted/50">
            <TabsTrigger
              value="overview"
              className="text-xs sm:text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="datasets"
              className="text-xs sm:text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              Data Sets
            </TabsTrigger>
            <TabsTrigger
              value="configuration"
              className="text-xs sm:text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              Config
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab
              balances={balances}
              isLoading={isBalanceLoading}
              isProcessingPayment={isProcessingPayment}
              onPayment={handlePayment}
              handleRefetchBalances={handleRefetchBalances}
            />
          </TabsContent>

          <TabsContent value="datasets">
            <DataSetsTab />
          </TabsContent>

          <TabsContent value="configuration">
            <ConfigurationTab />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default StorageBalance;
