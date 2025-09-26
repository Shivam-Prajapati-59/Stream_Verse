import { createThirdwebClient } from "thirdweb";
import { facilitator, settlePayment } from "thirdweb/x402";
import { arbitrumSepolia } from "thirdweb/chains";

const client = createThirdwebClient({ secretKey: "your-secret-key" });
const thirdwebX402Facilitator = facilitator({
  client,
  serverWalletAddress: "0xYourWalletAddress",
});

export async function middleware(request: NextRequest) {
  const method = request.method.toUpperCase();
  const resourceUrl = request.nextUrl.toString();
  const paymentData = request.headers.get("X-PAYMENT");

  const result = await settlePayment({
    resourceUrl,
    method,
    paymentData,
    payTo: "0xYourWalletAddress",
    network: arbitrumSepolia, // or any other chain
    price: "$0.01", // can also be a ERC20 token amount
    routeConfig: {
      description: "Access to paid content",
    },
    facilitator: thirdwebX402Facilitator,
  });

  if (result.status === 200) {
    // payment successful, execute the request
    const response = NextResponse.next();
    // optionally set the response headers back to the client
    for (const [key, value] of Object.entries(result.responseHeaders)) {
      response.headers.set(key, value);
    }
    return response;
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
