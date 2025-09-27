// "use server";

// import React from "react";
// import { wrapFetchWithPayment, decodeXPaymentResponse } from "x402-fetch";
// import { createWalletClient, http } from "viem";
// import { privateKeyToAccount } from "viem/accounts";
// import { polygonAmoy } from "viem/chains";

// export default async function Page() {
//   // --- Validate env ---
//   const privateKey = process.env.PRIVATE_KEY as `0x${string}`;
//   if (!privateKey) {
//     // Throwing will surface a readable server error; you could also render a friendly error UI.
//     throw new Error(
//       "PRIVATE_KEY not set in .env file (server-only). Do NOT put secrets on the client."
//     );
//   }

//   const FACILITATOR_URL =
//     process.env.FACILITATOR_URL || "https://x402.polygon.technology";
//   const QUICKSTART_RESOURCE_URL =
//     process.env.QUICKSTART_RESOURCE_URL || "http://127.0.0.1:4021/weather";

//   // --- Create wallet client (server-side) ---
//   const account = privateKeyToAccount(
//     privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`
//   );
//   const client = createWalletClient({
//     account,
//     chain: polygonAmoy,
//     transport: http(),
//   });

//   // Wrap the global fetch with x402 payment helper
//   const fetchWithPayment = wrapFetchWithPayment(
//     globalThis.fetch as typeof fetch,
//     client,
//     {
//       facilitatorUrl: FACILITATOR_URL,
//     }
//   );

//   // Call the paid endpoint and capture both body & x-payment-response header (if present)
//   let responseBody: any = null;
//   let paymentResponse: any = null;
//   let fetchError: any = null;

//   try {
//     const response = await fetchWithPayment(QUICKSTART_RESOURCE_URL, {
//       method: "GET",
//     });

//     // Try to parse JSON body safely
//     try {
//       responseBody = await response.json();
//     } catch (err) {
//       responseBody = await response.text();
//     }

//     // Decode X-PAYMENT response header (if the server returned it)
//     const header = response.headers.get("x-payment-response");
//     if (header) {
//       try {
//         paymentResponse = decodeXPaymentResponse(header);
//       } catch (err) {
//         // decoding failed — keep raw header for debugging
//         paymentResponse = { rawHeader: header, decodeError: String(err) };
//       }
//     }
//   } catch (err: any) {
//     // capture for rendering (do NOT leak sensitive details to client in production)
//     fetchError = {
//       message: err?.message ?? String(err),
//       stack: err?.stack,
//       // If the library returns an error.response, it might contain HTTP details; keep minimal info.
//       status: err?.response?.status,
//     };
//     console.error("fetchWithPayment error:", fetchError);
//   }

//   // Render results (server-side). This keeps secrets on server and only shows non-sensitive results in HTML.
//   return (
//     <div
//       style={{
//         padding: 20,
//         fontFamily: "Inter, Roboto, system-ui, sans-serif",
//       }}
//     >
//       <h1>Paid fetch demo (server-side)</h1>
//       <p>
//         Using wallet: <code>{account.address}</code>
//       </p>

//       <h2>Response body</h2>
//       <pre style={{ whiteSpace: "pre-wrap", maxWidth: 1000 }}>
//         {JSON.stringify(responseBody, null, 2)}
//       </pre>

//       <h2>Payment response (decoded)</h2>
//       <pre style={{ whiteSpace: "pre-wrap", maxWidth: 1000 }}>
//         {JSON.stringify(paymentResponse, null, 2)}
//       </pre>

//       {fetchError && (
//         <>
//           <h2 style={{ color: "crimson" }}>Fetch error</h2>
//           <pre style={{ whiteSpace: "pre-wrap", maxWidth: 1000 }}>
//             {JSON.stringify(fetchError, null, 2)}
//           </pre>
//         </>
//       )}

//       <hr />
//       <small>
//         Note: This component runs server-side only. Do not expose PRIVATE_KEY in
//         client bundles.
//       </small>
//     </div>
//   );
// }
