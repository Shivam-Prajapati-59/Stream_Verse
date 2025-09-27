"use client";

import React, { useState, useEffect } from "react";
import { createThirdwebClient } from "thirdweb";
import { wrapFetchWithPayment } from "thirdweb/x402";
import { useActiveWallet } from "thirdweb/react";
import VideoPlayer from "./VideoPlayer";

const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "your-client-id";
const client = createThirdwebClient({ clientId: clientId });

interface Video {
  id: string;
  title: string;
  description: string;
  duration: string;
  price: string;
  url?: string;
}

interface VideoGalleryProps {
  className?: string;
}

const VideoGallery: React.FC<VideoGalleryProps> = ({ className = "" }) => {
  const wallet = useActiveWallet();
  const [videos, setVideos] = useState<Video[]>([]);
  const [purchasedVideos, setPurchasedVideos] = useState<Set<string>>(
    new Set()
  );
  const [loadingVideo, setLoadingVideo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch available videos on component mount
  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await fetch("/api/video");
      if (response.ok) {
        const data = await response.json();
        setVideos(data.videos || []);
      }
    } catch (error) {
      console.error("Failed to fetch videos:", error);
      setError("Failed to load videos");
    }
  };

  const purchaseVideo = async (videoId: string) => {
    if (!wallet) {
      setError("Please connect your wallet first");
      return;
    }

    setLoadingVideo(videoId);
    setError(null);

    try {
      console.log(`[VideoGallery] Initiating purchase for video ${videoId}`);

      const fetchWithPay = wrapFetchWithPayment(fetch, client, wallet);
      const response = await fetchWithPay(`/api/video?id=${videoId}`);

      console.log(`[VideoGallery] Response status: ${response.status}`);

      if (response.ok) {
        const data = await response.json();
        console.log("[VideoGallery] Purchase successful:", data);

        // Add to purchased videos
        setPurchasedVideos((prev) => new Set(prev).add(videoId));

        // Update the video with the URL
        setVideos((prev) =>
          prev.map((video) =>
            video.id === videoId ? { ...video, url: data.video.url } : video
          )
        );

        setError(null); // Clear any previous errors
      } else {
        let errorMessage = "Purchase failed";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError);
        }

        console.error(`[VideoGallery] Purchase failed: ${errorMessage}`);
        setError(errorMessage);
      }
    } catch (error) {
      console.error("[VideoGallery] Purchase error:", error);

      let errorMessage = "Purchase failed. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setLoadingVideo(null);
    }
  };

  if (error) {
    return (
      <div
        className={`bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded ${className}`}
      >
        {error}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <h2 className="text-2xl font-bold text-center mb-8">Video Gallery</h2>

      {videos.length === 0 ? (
        <div className="text-center text-gray-500">Loading videos...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => {
            const isPurchased = purchasedVideos.has(video.id);
            const isLoading = loadingVideo === video.id;

            return (
              <div
                key={video.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden"
              >
                {isPurchased && video.url ? (
                  <VideoPlayer
                    src={video.url}
                    title={video.title}
                    width="100%"
                    height="200px"
                    controls={true}
                  />
                ) : (
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🔒</div>
                      <div className="text-sm text-gray-600">
                        Premium Content
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{video.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {video.description}
                  </p>

                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-gray-500">
                      Duration: {video.duration}
                    </span>
                    <span className="font-bold text-green-600">
                      {video.price}
                    </span>
                  </div>

                  {!isPurchased && (
                    <button
                      onClick={() => purchaseVideo(video.id)}
                      disabled={!wallet || isLoading}
                      className={`w-full py-2 px-4 rounded-lg font-medium ${
                        wallet && !isLoading
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-gray-400 text-gray-700 cursor-not-allowed"
                      }`}
                    >
                      {isLoading
                        ? "Processing..."
                        : wallet
                        ? `Buy for ${video.price}`
                        : "Connect Wallet"}
                    </button>
                  )}

                  {isPurchased && (
                    <div className="w-full py-2 px-4 rounded-lg bg-green-100 text-green-800 text-center font-medium">
                      ✓ Purchased
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VideoGallery;
