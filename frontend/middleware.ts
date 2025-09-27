// src/middleware.ts

import { facilitator, settlePayment } from "thirdweb/x402";
import { createThirdwebClient } from "thirdweb";
import { polygonAmoy } from "thirdweb/chains";
import { NextRequest, NextResponse } from "next/server";

const secretKey = process.env.THIRDWEB_SECRET_KEY!;

const client = createThirdwebClient({ secretKey: secretKey });
const thirdwebX402Facilitator = facilitator({
  client,
  serverWalletAddress: process.env.SERVER_WALLET_ADDRESS!,
});

export async function middleware(request: NextRequest) {
  const method = request.method.toUpperCase();
  const resourceUrl = request.nextUrl.toString();
  const paymentData = request.headers.get("X-PAYMENT");

  const result = await settlePayment({
    resourceUrl,
    method,
    paymentData,
    payTo: process.env.PAY_ADDRESS as `0x${string}`,
    network: polygonAmoy, // or any other chain
    price: {
      amount: "100000", // 0.1 USDC in smallest units (6 decimals)
      asset: {
        address: "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582", // USDC on Polygon Amoy
        decimals: 6,
        eip712: {
          name: "USDC",
          version: "1",
          primaryType: "TransferWithAuthorization",
        },
      },
    },
    facilitator: thirdwebX402Facilitator,
  });

  console.log("Payment settlement result:", result);

  if (result.status === 200) {
    return NextResponse.next();
  }

  // otherwise, request payment
  return NextResponse.json(result.responseBody, {
    status: result.status,
    headers: result.responseHeaders,
  });
}

// Configure which paths the middleware should run on
export const config = {
  matcher: ["/api/video/:path*"],
};
