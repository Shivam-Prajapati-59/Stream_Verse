"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import VideoPlayer from "@/components/custom/VideoPlayer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Video, Coins, Clock, Shield, ArrowLeft, Grid3X3 } from "lucide-react";

export default function StreamingPage() {
  const [videoCommp, setVideoCommp] = useState(""); // No default CID
  const [isValidCid, setIsValidCid] = useState(true);
  const [videoTitle, setVideoTitle] = useState("StreamVerse Player");
  const [videoDescription, setVideoDescription] = useState(
    "Decentralized pay-per-chunk streaming"
  );

  const searchParams = useSearchParams();

  // Handle URL parameters for direct video loading
  useEffect(() => {
    const cidFromUrl = searchParams.get("cid");
    const titleFromUrl = searchParams.get("title");

    if (cidFromUrl) {
      handleCidChange(cidFromUrl);
      if (titleFromUrl) {
        setVideoTitle(decodeURIComponent(titleFromUrl));
        setVideoDescription(`Streaming: ${decodeURIComponent(titleFromUrl)}`);
      }
    }
  }, [searchParams]);

  const handleCidChange = (value: string) => {
    setVideoCommp(value);
    // Basic CID validation (starts with Qm or baf)
    setIsValidCid(
      value.length > 10 && (value.startsWith("Qm") || value.startsWith("baf"))
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            onClick={() => window.open("/explore", "_self")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Gallery
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open("/explore", "_self")}
            className="flex items-center gap-2"
          >
            <Grid3X3 className="w-4 h-4" />
            Browse Videos
          </Button>
        </div>
      </div>
      <Separator />
      {/* Video Input */}
      <Card>
        <CardHeader>
          <CardTitle>Enter Video CID</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Enter Synapse/IPFS CID (e.g., QmExampleCID123)"
              value={videoCommp}
              onChange={(e) => handleCidChange(e.target.value)}
              className={!isValidCid ? "border-red-500" : ""}
            />
            {!isValidCid && videoCommp.length > 0 && (
              <Alert variant="destructive">
                <AlertDescription>
                  Please enter a valid CID (should start with 'Qm' or 'baf')
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Video Player */}
      {isValidCid && (
        <VideoPlayer
          videoCommp={videoCommp}
          title={videoTitle}
          description={videoDescription}
        />
      )}

      {/* Technical Details */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold">Blockchain Integration</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• X402 HTTP payment protocol</li>
                <li>• Polygon Amoy testnet</li>
                <li>• USDC micro-payments</li>
                <li>• Automatic payment verification</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Streaming Technology</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Filecoin storage via Synapse SDK</li>
                <li>• 10-second chunk segmentation</li>
                <li>• Range-based HTTP streaming</li>
                <li>• Real-time payment processing</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
