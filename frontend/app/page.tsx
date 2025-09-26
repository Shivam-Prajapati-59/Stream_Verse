"use client";

import React from "react";
import { createThirdwebClient } from "thirdweb";
import { wrapFetchWithPayment } from "thirdweb/x402";
import { useActiveWallet, ConnectButton } from "thirdweb/react";

const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "your-client-id";
const client = createThirdwebClient({ clientId: clientId });

const Home = () => {
  const wallet = useActiveWallet();

  const onClick = async () => {
    if (!wallet) {
      console.error("No wallet connected");
      return;
    }

    try {
      const fetchWithPay = wrapFetchWithPayment(fetch, client, wallet);
      const response = await fetchWithPay("/api/video");
      console.log("Payment response:", response);
    } catch (error) {
      console.error("Payment failed:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      <h1 className="text-3xl font-bold">Hello World</h1>

      {/* Wallet Connect Button */}
      <ConnectButton client={client} theme="dark" />

      {/* Payment Button */}
      <button
        onClick={onClick}
        disabled={!wallet}
        className={`px-6 py-2 rounded-lg font-medium ${
          wallet
            ? "bg-blue-600 hover:bg-blue-700 text-white"
            : "bg-gray-400 text-gray-700 cursor-not-allowed"
        }`}
      >
        {wallet ? "Pay Now" : "Connect Wallet First"}
      </button>
    </div>
  );
};

export default Home;
