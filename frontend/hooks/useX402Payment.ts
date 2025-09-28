import { useState, useCallback } from "react";
import { wrapFetchWithPayment, decodeXPaymentResponse } from "x402-fetch";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { polygonAmoy } from "viem/chains";

interface X402PaymentOptions {
  facilitatorUrl?: string;
}

interface PaymentResult {
  success: boolean;
  data?: ArrayBuffer;
  error?: string;
  paymentResponse?: any;
  transactionHash?: string;
}

export const useX402Payment = (options: X402PaymentOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const facilitatorUrl =
    options.facilitatorUrl || "https://x402.polygon.technology";

  const makePayment = useCallback(
    async (
      url: string,
      requestOptions: RequestInit = {}
    ): Promise<PaymentResult> => {
      setIsLoading(true);
      setError(null);

      try {
        console.log(`🔄 Making X402 payment request to: ${url}`);
        console.log(`💡 Using facilitator: ${facilitatorUrl}`);

        // Use private key from environment (same as buyer.js)
        const privateKey = process.env.NEXT_PUBLIC_PRIVATE_KEY;
        if (!privateKey) {
          throw new Error("NEXT_PUBLIC_PRIVATE_KEY not set in environment");
        }

        // Create wallet client like buyer.js
        const account = privateKeyToAccount(`0x${privateKey}`);
        const client = createWalletClient({
          account,
          chain: polygonAmoy,
          transport: http(),
        });

        console.log(`👛 Using wallet address: ${account.address}`);

        // Create X402-enabled fetch (exact same as buyer.js)
        const fetchWithPayment = (wrapFetchWithPayment as any)(fetch, client, {
          facilitatorUrl: facilitatorUrl,
        });

        // Make X402 payment request (same as buyer.js)
        const response = await fetchWithPayment(url, {
          method: "GET",
          headers: {
            Accept: "application/octet-stream",
            ...requestOptions.headers,
          },
          ...requestOptions,
        });

        console.log(`� Response status: ${response.status}`);
        console.log(
          `📋 Response headers:`,
          Object.fromEntries(response.headers.entries())
        );

        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }

        // Check if payment is required (402 status)
        if (response.status === 402) {
          throw new Error(
            "Payment required - X402 middleware should handle this automatically"
          );
        }

        const data = await response.arrayBuffer();

        // Extract X402 payment response headers
        const xPaymentResponse = response.headers.get("x-payment-response");
        const transactionHash = response.headers.get("x-transaction-hash");
        const paymentAmount = response.headers.get("x-payment-amount");
        const paymentCurrency = response.headers.get("x-payment-currency");
        const paymentNetwork = response.headers.get("x-payment-network");
        const paymentTimestamp = response.headers.get("x-payment-timestamp");
        const paymentVerified = response.headers.get("x-payment-verified");

        // Try to decode X402 payment response if available
        let decodedPayment = null;
        if (xPaymentResponse) {
          try {
            const { decodeXPaymentResponse } = await import("x402-fetch");
            decodedPayment = decodeXPaymentResponse(xPaymentResponse);
            console.log("📄 Decoded X402 payment response:", decodedPayment);
          } catch (err) {
            console.warn("⚠️ Could not decode X402 payment response:", err);
          }
        }

        // Use transaction hash from X402 response or server headers
        const finalTransactionHash =
          decodedPayment?.transaction || transactionHash;

        if (!finalTransactionHash) {
          console.error("❌ No transaction hash in X402 response");
          console.error(
            "Response headers:",
            Object.fromEntries(response.headers.entries())
          );
          console.error("X402 payment response:", xPaymentResponse);
          throw new Error(
            "No transaction hash received from X402 payment system"
          );
        }

        // Validate transaction hash format (should be 0x followed by 64 hex characters)
        if (!/^0x[a-fA-F0-9]{64}$/.test(finalTransactionHash)) {
          console.error(
            "❌ Invalid transaction hash format:",
            finalTransactionHash
          );
          throw new Error(
            `Invalid transaction hash format: ${finalTransactionHash}`
          );
        }

        console.log("✅ Payment successful!");
        console.log("� Payment details:", {
          transactionHash: finalTransactionHash,
          amount: paymentAmount,
          currency: paymentCurrency,
          network: paymentNetwork,
          timestamp: paymentTimestamp,
          verified: paymentVerified,
        });

        const paymentResult = {
          transactionHash: finalTransactionHash,
          amount: paymentAmount || "0.001",
          currency: paymentCurrency || "USDC",
          network: paymentNetwork || "polygon-amoy",
          timestamp: paymentTimestamp || new Date().toISOString(),
          chunkData: data,
        };

        setIsLoading(false);

        return {
          success: true,
          data,
          paymentResponse: xPaymentResponse || undefined,
          transactionHash: finalTransactionHash,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Payment failed";
        setError(errorMessage);
        setIsLoading(false);
        return { success: false, error: errorMessage };
      }
    },
    [facilitatorUrl]
  );

  return {
    makePayment,
    isLoading,
    error,
    clearError: () => setError(null),
  };
};
