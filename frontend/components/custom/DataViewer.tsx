// components/DataViewer.tsx
"use client";

import { useAccount } from "wagmi";
import { useDatasets } from "@/hooks/useDataviewer";
import { useDownloadPiece } from "@/hooks/useDownloadPiece";
import { EnhancedDataSetWithPieces } from "@/types/types";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  RefreshCw,
  Globe,
  Server,
  Database,
  Copy,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

/**
 * Utility function to safely convert CID objects to strings
 * Handles both string CIDs and CID objects from the Synapse SDK
 */
const cidToString = (cid: unknown): string => {
  if (typeof cid === "string") {
    return cid;
  }
  if (
    cid &&
    typeof cid === "object" &&
    "toString" in cid &&
    typeof cid.toString === "function"
  ) {
    return cid.toString();
  }
  return "Unknown CID";
};

export const DataViewer = () => {
  const { isConnected } = useAccount();
  const {
    data,
    isLoading: isLoadingDatasets,
    error,
    refetch,
    isFetching,
  } = useDatasets();
  const [selectedTab, setSelectedTab] = useState("all");

  if (!isConnected) {
    return (
      <Card className="mt-4">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              Connect Your Wallet
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Please connect your wallet to view your datasets
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mt-4">
        <CardContent className="py-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Failed to load datasets: {error.message}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`}
                />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const datasets = data?.datasets || [];
  const liveDatasets = datasets.filter((d) => d.isLive);
  const cdnDatasets = datasets.filter((d) => d.withCDN);
  const managedDatasets = datasets.filter((d) => d.isManaged);
  const datasetsWithErrors = datasets.filter((d) => d.error);

  const getFilteredDatasets = () => {
    switch (selectedTab) {
      case "live":
        return liveDatasets;
      case "cdn":
        return cdnDatasets;
      case "managed":
        return managedDatasets;
      case "errors":
        return datasetsWithErrors;
      default:
        return datasets;
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader className="sticky top-0 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border-b z-10">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Datasets
              {isLoadingDatasets && (
                <RefreshCw className="h-4 w-4 animate-spin" />
              )}
            </CardTitle>
            <CardDescription>
              Manage your decentralized storage datasets on Filecoin
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {datasets.length}
            </div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {liveDatasets.length}
            </div>
            <div className="text-xs text-muted-foreground">Live</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {cdnDatasets.length}
            </div>
            <div className="text-xs text-muted-foreground">CDN Enabled</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {managedDatasets.length}
            </div>
            <div className="text-xs text-muted-foreground">Managed</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {isLoadingDatasets ? (
          <DatasetLoadingSkeleton />
        ) : datasets.length === 0 ? (
          <EmptyDatasetState />
        ) : (
          <Tabs
            value={selectedTab}
            onValueChange={setSelectedTab}
            className="space-y-4"
          >
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All ({datasets.length})</TabsTrigger>
              <TabsTrigger value="live">
                Live ({liveDatasets.length})
              </TabsTrigger>
              <TabsTrigger value="cdn">CDN ({cdnDatasets.length})</TabsTrigger>
              <TabsTrigger value="managed">
                Managed ({managedDatasets.length})
              </TabsTrigger>
              <TabsTrigger value="errors">
                Errors ({datasetsWithErrors.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab} className="space-y-4">
              {getFilteredDatasets().map((dataset) => (
                <DatasetCard
                  key={dataset.pdpVerifierDataSetId}
                  dataset={dataset}
                />
              ))}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Individual dataset card component with enhanced information display
 */
const DatasetCard = ({ dataset }: { dataset: EnhancedDataSetWithPieces }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch (_error) {
      toast.error(`Failed to copy ${label}`);
    }
  };

  return (
    <Card
      className={`transition-all duration-200 ${
        dataset.error ? "border-destructive/50" : ""
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              Dataset #{dataset.pdpVerifierDataSetId}
              <StatusBadges dataset={dataset} />
            </CardTitle>
            <CardDescription className="space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <span>Provider ID: {dataset.providerId}</span>
                {dataset.provider?.name && (
                  <>
                    <span>•</span>
                    <span>{dataset.provider.name}</span>
                  </>
                )}
              </div>
              {dataset.serviceURL && (
                <div className="flex items-center gap-2 text-sm">
                  <Server className="h-3 w-3" />
                  <button
                    onClick={() =>
                      copyToClipboard(dataset.serviceURL!, "Service URL")
                    }
                    className="hover:text-primary transition-colors cursor-pointer flex items-center gap-1"
                  >
                    {dataset.serviceURL}
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              )}
            </CardDescription>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Less" : "More"}
          </Button>
        </div>

        {dataset.error && (
          <Alert variant="destructive" className="mt-3">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{dataset.error}</AlertDescription>
          </Alert>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <div className="text-sm text-muted-foreground">Pieces</div>
            <div className="font-medium">{dataset.currentPieceCount}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Next Piece ID</div>
            <div className="font-medium">{dataset.nextPieceId}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Commission</div>
            <div className="font-medium">
              {(dataset.commissionBps / 100).toFixed(2)}%
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Client ID</div>
            <div className="font-medium">{dataset.clientDataSetId}</div>
          </div>
        </div>

        {isExpanded && <ExpandedDatasetInfo dataset={dataset} />}

        {dataset.data?.pieces && dataset.data.pieces.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Stored Pieces ({dataset.data.pieces.length})
              {dataset.data.nextChallengeEpoch && (
                <Badge variant="outline" className="ml-auto">
                  Next Challenge: Epoch {dataset.data.nextChallengeEpoch}
                </Badge>
              )}
            </h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {dataset.data.pieces.map((piece, index) => (
                <PieceCard
                  key={`${dataset.pdpVerifierDataSetId}-${
                    piece.pieceId || index
                  }`}
                  piece={piece}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Component to display individual piece with download functionality
 */
const PieceCard = ({
  piece,
}: {
  piece: { pieceId: number; pieceCid: unknown; rawSize: number; uuid: string };
}) => {
  // Convert CID object to string if necessary using utility function
  const pieceCidString = cidToString(piece.pieceCid);

  const filename = `piece-${pieceCidString}.dat`;
  const { downloadMutation } = useDownloadPiece(pieceCidString, filename);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded border">
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Piece #{piece.pieceId}</span>
          <Badge variant="secondary" className="text-xs">
            {formatBytes(piece.rawSize)}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground font-mono truncate">
          {pieceCidString}
        </p>
      </div>
      <Button
        onClick={() => downloadMutation.mutate()}
        disabled={downloadMutation.isPending}
        size="sm"
        variant="outline"
        className="ml-4"
      >
        {downloadMutation.isPending ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};

/**
 * Status badges component
 */
const StatusBadges = ({ dataset }: { dataset: EnhancedDataSetWithPieces }) => {
  return (
    <div className="flex items-center gap-2">
      <Badge variant={dataset.isLive ? "default" : "secondary"}>
        {dataset.isLive ? (
          <CheckCircle2 className="h-3 w-3 mr-1" />
        ) : (
          <Clock className="h-3 w-3 mr-1" />
        )}
        {dataset.isLive ? "Live" : "Inactive"}
      </Badge>

      {dataset.withCDN && (
        <Badge variant="outline" className="text-purple-600 border-purple-200">
          <Globe className="h-3 w-3 mr-1" />
          CDN
        </Badge>
      )}

      {dataset.isManaged && (
        <Badge variant="outline" className="text-blue-600 border-blue-200">
          Managed
        </Badge>
      )}

      {dataset.error && (
        <Badge variant="destructive">
          <AlertCircle className="h-3 w-3 mr-1" />
          Error
        </Badge>
      )}
    </div>
  );
};

/**
 * Expanded dataset information component
 */
const ExpandedDatasetInfo = ({
  dataset,
}: {
  dataset: EnhancedDataSetWithPieces;
}) => {
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch (_error) {
      toast.error(`Failed to copy ${label}`);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h5 className="text-sm font-medium mb-2">Payment Information</h5>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rail ID:</span>
              <span className="font-mono">{dataset.railId.toString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payer:</span>
              <button
                onClick={() => copyToClipboard(dataset.payer, "Payer Address")}
                className="font-mono text-xs hover:text-primary transition-colors cursor-pointer flex items-center gap-1"
              >
                {`${dataset.payer.slice(0, 6)}...${dataset.payer.slice(-4)}`}
                <Copy className="h-3 w-3" />
              </button>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payee:</span>
              <button
                onClick={() => copyToClipboard(dataset.payee, "Payee Address")}
                className="font-mono text-xs hover:text-primary transition-colors cursor-pointer flex items-center gap-1"
              >
                {`${dataset.payee.slice(0, 6)}...${dataset.payee.slice(-4)}`}
                <Copy className="h-3 w-3" />
              </button>
            </div>
            {dataset.paymentEndEpoch && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Payment End Epoch:
                </span>
                <span>{dataset.paymentEndEpoch}</span>
              </div>
            )}
          </div>
        </div>

        <div>
          <h5 className="text-sm font-medium mb-2">Metadata</h5>
          {Object.keys(dataset.metadata).length > 0 ? (
            <div className="space-y-1">
              {Object.entries(dataset.metadata).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{key}:</span>
                  <span className="font-mono text-xs">
                    {value || "(empty)"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No metadata available
            </p>
          )}
        </div>
      </div>

      {dataset.provider && (
        <div>
          <h5 className="text-sm font-medium mb-2">Provider Information</h5>
          <div className="space-y-2 text-sm">
            {dataset.provider.name && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span>{dataset.provider.name}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">ID:</span>
              <span>{dataset.provider.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Address:</span>
              <button
                onClick={() =>
                  copyToClipboard(
                    dataset.provider.serviceProvider,
                    "Provider Address"
                  )
                }
                className="font-mono text-xs hover:text-primary transition-colors cursor-pointer flex items-center gap-1"
              >
                {`${dataset.provider.serviceProvider.slice(
                  0,
                  6
                )}...${dataset.provider.serviceProvider.slice(-4)}`}
                <Copy className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Loading skeleton component
 */
const DatasetLoadingSkeleton = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="h-6 bg-muted rounded w-48 animate-pulse" />
                <div className="h-4 bg-muted rounded w-64 animate-pulse" />
              </div>
              <div className="h-8 bg-muted rounded w-16 animate-pulse" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="space-y-2">
                  <div className="h-3 bg-muted rounded w-20 animate-pulse" />
                  <div className="h-4 bg-muted rounded w-16 animate-pulse" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

/**
 * Empty state component
 */
const EmptyDatasetState = () => {
  return (
    <div className="text-center py-12">
      <Database className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium text-muted-foreground mb-2">
        No Datasets Found
      </h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
        You haven&apos;t created any datasets yet. Upload your first file to get
        started with decentralized storage.
      </p>
      <Button asChild>
        <a href="/streams">
          <FileText className="h-4 w-4 mr-2" />
          Upload Your First File
        </a>
      </Button>
    </div>
  );
};
