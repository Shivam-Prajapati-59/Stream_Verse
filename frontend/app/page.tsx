"use client";

import React, { useState } from "react";
import { createThirdwebClient } from "thirdweb";
import { wrapFetchWithPayment } from "thirdweb/x402";
import { useActiveWallet, ConnectButton } from "thirdweb/react";
import VideoPlayer from "../components/custom/VideoPlayer";
import VideoGallery from "../components/custom/VideoGallery";

const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "your-client-id";
const client = createThirdwebClient({ clientId: clientId });

const Home = () => {
  const wallet = useActiveWallet();
  const [hasLocalAccess, setHasLocalAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"local" | "gallery">("local");

  const onClick = async () => {
    if (!wallet) {
      console.error("No wallet connected");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const fetchWithPay = wrapFetchWithPayment(fetch, client, wallet);
      const response = await fetchWithPay("/api/video?id=1");

      if (response.ok) {
        const data = await response.json();
        console.log("Payment response:", data);
        setHasLocalAccess(true);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Payment failed");
      }
    } catch (error) {
      console.error("Payment failed:", error);
      setError("Payment failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Stream Verse</h1>
            <ConnectButton client={client} theme="dark" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg mb-8 max-w-md mx-auto">
          <button
            onClick={() => setActiveTab("local")}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === "local"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Local Video (.dat)
          </button>
          <button
            onClick={() => setActiveTab("gallery")}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === "gallery"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Video Gallery
          </button>
        </div>

        {/* Local Video Tab */}
        {activeTab === "local" && (
          <div className="text-center">
            {!hasLocalAccess ? (
              <div className="max-w-2xl mx-auto">
                <div className="bg-white p-8 rounded-lg shadow-md mb-6">
                  <h2 className="text-2xl font-semibold mb-4">
                    Local Premium Video
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Watch the exclusive video stored locally on the server (.dat
                    file)
                  </p>
                  <p className="text-lg text-green-600 font-semibold mb-6">
                    Price: $0.01
                  </p>
                  <button
                    onClick={onClick}
                    disabled={!wallet || isLoading}
                    className={`px-8 py-3 rounded-lg font-medium text-lg ${
                      wallet && !isLoading
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-gray-400 text-gray-700 cursor-not-allowed"
                    }`}
                  >
                    {isLoading
                      ? "Processing..."
                      : wallet
                      ? "Pay $0.01 to Watch"
                      : "Connect Wallet First"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-semibold mb-6">
                  Local Premium Video
                </h2>
                <VideoPlayer
                  src="/api/video/stream"
                  title="Local Premium Video (.dat file)"
                  width="100%"
                  height="500px"
                  controls={true}
                  className="shadow-lg"
                />
              </div>
            )}
          </div>
        )}

        {/* Video Gallery Tab */}
        {activeTab === "gallery" && (
          <VideoGallery className="max-w-7xl mx-auto" />
        )}
      </div>
    </div>
  );
};

export default Home;
