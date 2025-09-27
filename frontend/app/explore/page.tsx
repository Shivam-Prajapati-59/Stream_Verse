"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Play,
  AlertCircle,
  Wallet,
  Video,
  Star,
  Clock,
  Shield,
} from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useX402Payment } from "@/hooks/useX402Payment";

// Mock video data - in a real app, this would come from an API
const featuredVideos = [
  {
    id: "1",
    title: "Formula 1 Highlights 2024",
    description: "Exclusive behind-the-scenes footage from the 2024 F1 season",
    price: "0.001 MATIC",
    duration: "25:30",
    quality: "4K",
    thumbnail: "/videos/Formula1.mp4", // Using the existing video as thumbnail
    category: "Sports",
    rating: 4.8,
  },
  {
    id: "2",
    title: "Tech Innovation Summit",
    description: "Latest tech trends and innovations from industry leaders",
    price: "0.001 MATIC",
    duration: "45:20",
    quality: "HD",
    thumbnail: "/videos/Formula1.mp4",
    category: "Technology",
    rating: 4.6,
  },
  {
    id: "3",
    title: "Crypto Deep Dive",
    description: "Understanding blockchain technology and Web3 fundamentals",
    price: "0.001 MATIC",
    duration: "32:15",
    quality: "HD",
    thumbnail: "/videos/Formula1.mp4",
    category: "Education",
    rating: 4.9,
  },
];

export default function ExplorePage() {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const {
    loading,
    error,
    videoUrl,
    success,
    makePayment,
    resetState,
    isConnected,
    address,
    chainId,
  } = useX402Payment();

  const handleVideoSelect = async (videoId: string) => {
    setSelectedVideo(videoId);
    resetState();

    // Make payment for the selected video
    const paymentSuccess = await makePayment("/api/video");
    if (!paymentSuccess) {
      setSelectedVideo(null);
    }
  };

  const handleBackToExplore = () => {
    setSelectedVideo(null);
    resetState();
  };

  // Check if we're on the correct network
  const isCorrectNetwork = chainId === 80002; // Polygon Amoy testnet

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Processing payment with X402 protocol...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state - show video player
  if (success && videoUrl && selectedVideo) {
    const video = featuredVideos.find((v) => v.id === selectedVideo);

    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                {video?.title || "Premium Video Content"}
              </CardTitle>
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                <Shield className="h-3 w-3 mr-1" />
                Payment Verified
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="aspect-video w-full mb-4">
              <video
                src={videoUrl}
                controls
                className="w-full h-full rounded-lg border"
                autoPlay
                playsInline
              >
                Your browser does not support the video tag.
              </video>
            </div>
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-green-600 font-medium">
                  ✅ Payment successful! Enjoy your premium content.
                </p>
                <p className="text-sm text-muted-foreground">
                  Powered by X402 Payment Protocol on Polygon Amoy
                </p>
              </div>
              <Button onClick={handleBackToExplore} variant="outline">
                Back to Explore
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="p-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="flex gap-2 mt-4">
              <Button onClick={resetState} variant="outline">
                Try Again
              </Button>
              <Button onClick={handleBackToExplore} variant="secondary">
                Back to Explore
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main explore page
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Explore Premium Content</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Stream exclusive videos with secure X402 payments on Polygon Amoy
          </p>

          {/* Connection Status */}
          <div className="flex items-center justify-center gap-4 mb-6">
            {!isConnected ? (
              <div className="flex flex-col items-center gap-2">
                <ConnectButton />
                <p className="text-xs text-muted-foreground">
                  Connect to Polygon Amoy testnet to access premium content
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Wallet className="h-4 w-4 text-green-600" />
                  <span className="text-green-600">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                </div>
                {isCorrectNetwork ? (
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800"
                  >
                    Polygon Amoy ✓
                  </Badge>
                ) : (
                  <Badge variant="destructive">Wrong Network</Badge>
                )}
                <ConnectButton showBalance={false} />
              </div>
            )}
          </div>

          {/* Network Warning */}
          {isConnected && !isCorrectNetwork && (
            <Alert className="max-w-md mx-auto mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please switch to Polygon Amoy testnet to access premium content.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredVideos.map((video) => (
            <Card
              key={video.id}
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="aspect-video bg-muted relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Video className="h-12 w-12 text-muted-foreground" />
                </div>
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary">{video.category}</Badge>
                </div>
                <div className="absolute top-2 right-2">
                  <Badge>{video.quality}</Badge>
                </div>
                <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                  <Clock className="h-3 w-3 inline mr-1" />
                  {video.duration}
                </div>
              </div>

              <CardContent className="p-4">
                <h3 className="font-semibold mb-2 line-clamp-2">
                  {video.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {video.description}
                </p>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{video.rating}</span>
                  </div>
                  <span className="font-semibold text-primary">
                    {video.price}
                  </span>
                </div>

                <Button
                  onClick={() => handleVideoSelect(video.id)}
                  disabled={!isConnected || !isCorrectNetwork || loading}
                  className="w-full"
                  size="sm"
                >
                  {!isConnected ? (
                    "Connect Wallet"
                  ) : !isCorrectNetwork ? (
                    "Switch Network"
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Pay & Watch
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer Info */}
        <div className="text-center mt-12 p-6 bg-muted/50 rounded-lg">
          <h3 className="font-semibold mb-2">
            Powered by X402 Payment Protocol
          </h3>
          <p className="text-sm text-muted-foreground">
            Secure, instant payments for digital content using Thirdweb X402 on
            Polygon Amoy testnet. Connect your wallet and enjoy seamless access
            to premium video content.
          </p>
        </div>
      </div>
    </div>
  );
}
