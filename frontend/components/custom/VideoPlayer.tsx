"use client";

import React, { useRef, useEffect, useState } from "react";
import { useStreamingVideo } from "@/hooks/useStreamingVideo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Play,
  Pause,
  Square,
  DollarSign,
  Clock,
  Wifi,
  ExternalLink,
  Copy,
  CheckCircle,
} from "lucide-react";

interface VideoPlayerProps {
  videoCommp: string;
  title?: string;
  description?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoCommp,
  title = "Streaming Video",
  description = "Pay-per-chunk video streaming",
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");

  const {
    currentChunk,
    isPlaying,
    currentTime,
    error,
    totalPaid,
    videoBlob,
    isLoading,
    transactionHashes,
    videoMetadata,
    startStreaming,
    stopStreaming,
    resetStreaming,
    chunkDuration,
    pricePerChunk,
    totalChunks,
    currentChunkIndex,
  } = useStreamingVideo(videoCommp, {
    chunkDurationSeconds: 10,
    pricePerChunk: "0.001",
  });

  // Create video URL when blob is available
  useEffect(() => {
    if (videoBlob) {
      const url = URL.createObjectURL(videoBlob);
      setVideoUrl(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [videoBlob]);

  // Handle video element updates and auto-play
  useEffect(() => {
    if (videoRef.current && videoUrl) {
      videoRef.current.src = videoUrl;
      // Auto-play when streaming starts
      if (isPlaying) {
        videoRef.current.play().catch(console.error);
      }
    }
  }, [videoUrl, isPlaying]);

  // Handle streaming state changes
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(console.error);
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(3)} USDC`;
  };

  const progress =
    totalChunks > 0 ? (currentChunkIndex / totalChunks) * 100 : 0;
  const actualDuration = videoMetadata?.duration || totalChunks * chunkDuration;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Video Player Card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="w-5 h-5" />
                {title}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {description}
              </p>
            </div>
            <Badge variant={isPlaying ? "default" : "secondary"}>
              {isPlaying ? "Streaming" : "Paused"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Video Element */}
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            {videoUrl ? (
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                controls={false}
                muted
                playsInline
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white bg-gradient-to-br from-gray-900 to-gray-800">
                <div className="text-center">
                  <Wifi className="w-16 h-16 mx-auto mb-4 opacity-70" />
                  <h3 className="text-xl font-semibold mb-2">
                    Ready to Stream
                  </h3>
                  <p className="text-gray-300 mb-4">
                    Enter a valid video CID to start streaming
                  </p>
                  <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      <span>Pay per chunk</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>10s segments</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p>Processing payment...</p>
                </div>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(actualDuration)}</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-2">
            <Button
              onClick={startStreaming}
              disabled={isPlaying || isLoading}
              variant="default"
              size="lg"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Stream
            </Button>

            <Button
              onClick={stopStreaming}
              disabled={!isPlaying}
              variant="outline"
              size="lg"
            >
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </Button>

            <Button onClick={resetStreaming} variant="outline" size="lg">
              <Square className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Video Info Card */}
      {videoMetadata && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="w-5 h-5" />
              Video Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.floor(videoMetadata.duration / 60)}:
                  {String(Math.floor(videoMetadata.duration % 60)).padStart(
                    2,
                    "0"
                  )}
                </div>
                <div className="text-sm text-muted-foreground">Duration</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {(videoMetadata.size / 1024 / 1024).toFixed(1)}MB
                </div>
                <div className="text-sm text-muted-foreground">File Size</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {totalChunks}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Chunks
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  ${(totalChunks * pricePerChunk).toFixed(3)}
                </div>
                <div className="text-sm text-muted-foreground">Total Cost</div>
              </div>

              {videoMetadata.width && videoMetadata.height && (
                <div className="text-center col-span-2">
                  <div className="text-lg font-bold text-gray-600">
                    {videoMetadata.width} × {videoMetadata.height}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Resolution
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Payment Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalPaid)}
              </div>
              <div className="text-sm text-muted-foreground">Total Paid</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold">
                {formatCurrency(pricePerChunk)}
              </div>
              <div className="text-sm text-muted-foreground">Per Chunk</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold">{currentChunkIndex}</div>
              <div className="text-sm text-muted-foreground">
                Chunks Watched
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold flex items-center justify-center gap-1">
                <Clock className="w-5 h-5" />
                {chunkDuration}s
              </div>
              <div className="text-sm text-muted-foreground">
                Chunk Duration
              </div>
            </div>
          </div>

          {/* Network Info */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Network:</span>
              <Badge variant="outline">Polygon Amoy</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chunk Info */}
      {currentChunk && (
        <Card>
          <CardHeader>
            <CardTitle>Current Chunk Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Chunk Index:</span>
                <span className="ml-2 font-mono">
                  {currentChunk.chunkIndex + 1}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Data Size:</span>
                <span className="ml-2 font-mono">
                  {(currentChunk.data.byteLength / 1024).toFixed(1)} KB
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Timestamp:</span>
                <span className="ml-2 font-mono">
                  {new Date(currentChunk.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <Badge variant="default" className="ml-2">
                  Paid & Loaded
                </Badge>
              </div>
              {currentChunk.transactionHash && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">
                    Transaction Hash:
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                      {currentChunk.transactionHash.slice(0, 20)}...
                      {currentChunk.transactionHash.slice(-6)}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        navigator.clipboard.writeText(
                          currentChunk.transactionHash!
                        )
                      }
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        window.open(
                          `https://amoy.polygonscan.com/tx/${currentChunk.transactionHash}`,
                          "_blank"
                        )
                      }
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction History */}
      {transactionHashes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Total Transactions:
                </span>
                <Badge variant="secondary">{transactionHashes.length}</Badge>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Transaction Hashes:</h4>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {transactionHashes.map((hash, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 bg-muted/50 rounded"
                    >
                      <span className="text-xs text-muted-foreground">
                        #{index + 1}
                      </span>
                      <span className="font-mono text-xs flex-1">
                        {hash.slice(0, 20)}...{hash.slice(-10)}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigator.clipboard.writeText(hash)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          window.open(
                            `https://amoy.polygonscan.com/tx/${hash}`,
                            "_blank"
                          )
                        }
                        className="h-6 w-6 p-0"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Verify on Polygon Amoy:
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      window.open("https://amoy.polygonscan.com/", "_blank")
                    }
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    PolygonScan Amoy
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VideoPlayer;
