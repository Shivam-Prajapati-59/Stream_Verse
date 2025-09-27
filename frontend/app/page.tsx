// app/page.tsx
"use client";

import { createThirdwebClient } from "thirdweb";
import { ConnectButton, useActiveWallet } from "thirdweb/react";
import { wrapFetchWithPayment } from "thirdweb/x402";
import { useState } from "react";
import { polygonAmoy } from "thirdweb/chains";

// Replace with your thirdweb client ID from dashboard.thirdweb.com
const clientId =
  process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "YOUR_THIRDWEB_CLIENT_ID";
const client = createThirdwebClient({ clientId: clientId });

export default function Home() {
  const wallet = useActiveWallet();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProtectedContent = async () => {
    if (!wallet) {
      setError("Please connect your wallet first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Wrap fetch with payment handling
      const fetchWithPay = wrapFetchWithPayment(fetch, client, wallet);
      const response = await fetchWithPay(
        "http://localhost:3000/api/video?id=1",
        {
          method: "GET",
        }
      );

      if (response.ok) {
        const jsonData = await response.json();
        setData(jsonData);
        console.log("Accessed paid content:", jsonData);
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (err) {
      console.error("Payment or request error:", err);
      setError(
        (err as Error).message || "An error occurred during payment or fetch."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Protected Video API Access</h1>

      {/* Connect Button with WalletConnect support */}
      <ConnectButton
        client={client}
        chain={polygonAmoy}
        connectModal={{
          size: "compact", // or 'wide'
          title: "Connect Wallet",
          welcomeScreen: {
            title: "Welcome",
            subtitle: "Connect to access paid content",
          },
        }}
        theme="light" // or "dark"
      />

      <button
        onClick={fetchProtectedContent}
        disabled={loading || !wallet}
        className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
      >
        {loading ? "Processing..." : "Fetch Protected Video (Pay 0.1 USDC)"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {data && (
        <div>
          <h2>Response Data:</h2>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
