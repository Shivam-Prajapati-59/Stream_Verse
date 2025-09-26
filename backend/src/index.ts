import express from "express";
import { paymentMiddleware } from "x402-express";

const app = express();

app.use(
  paymentMiddleware(
    process.env.PAYMENT_ADDRESS as `0x${string}`, // your receiving wallet address
    {
      "GET /weather": {
        price: "$0.001", // USDC amount in dollars
        network: "polygon-amoy",
        config: {
          description: "Get current weather data",
          inputSchema: {
            type: "object",
            properties: {
              location: { type: "string" },
            },
          },
        },
      },
    },
    {
      url: process.env.FACILITATOR_URL || "https://x402.polygon.technology",
    }
  )
);

app.get("/weather", (req, res) => {
  res.json({
    weather: "sunny",
    temperature: 70,
  });
});

app.listen(4021, () => {
  console.log(`Seller running on http://localhost:4021`);
});
