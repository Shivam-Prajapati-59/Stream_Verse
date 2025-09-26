// src/middleware.ts

import { facilitator, settlePayment } from "thirdweb/x402";
import { createThirdwebClient } from "thirdweb";
import { arbitrumSepolia, polygonAmoy } from "thirdweb/chains";
import { NextRequest, NextResponse } from "next/server";

const serverWalletAddress = process.env.SERVER_WALLET_ADDRESS;

const secretKeyThird = process.env.THIRDWEB_SECRET_KEY!;

const client = createThirdwebClient({ secretKey: secretKeyThird });
const thirdwebX402Facilitator = facilitator({
  client,
  serverWalletAddress: serverWalletAddress as `0x{string}`,
});

export async function middleware(request: NextRequest) {
  const method = request.method.toUpperCase();
  const resourceUrl = request.nextUrl.toString();
  const paymentData = request.headers.get("X-PAYMENT");

  const result = await settlePayment({
    resourceUrl,
    method,
    paymentData,
    payTo: process.env.SERVER_WALLET_ADDRESS as `0x${string}`,
    network: polygonAmoy, // or any other chain
    price: "$0.01", // can also be a ERC20 token amount
    facilitator: thirdwebX402Facilitator,
  });

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
  matcher: ["/api/paid-endpoint"],
};
