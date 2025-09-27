import { wrapFetchWithPayment, decodeXPaymentResponse } from "x402-fetch";

const account = process.env.PRIVATE_KEY! as `0x${string}`; // your wallet private key
const fetchWithPayment = wrapFetchWithPayment(fetch, account as any);

fetchWithPayment("http://localhost:4021/weather", {
  method: "GET",
})
  .then(async (response) => {
    const data = await response.json();
    console.log("Response:", data);

    const paymentResponse = decodeXPaymentResponse(
      response.headers.get("x-payment-response") || ""
    );
    console.log("Payment details:", paymentResponse);
  })
  .catch((error) => {
    console.error("Error:", error.response?.data?.error || error.message);
  });
