import express from "express";
import dotenv from "dotenv";
import { paymentMiddleware, Network } from "x402-express";

dotenv.config();

const app = express();
app.use(express.json());

// Configure the payment middleware

app.use(
  paymentMiddleware(
    "0xYourAddress", // 👈 replace with your Polygon Amoy wallet address
    {
      "/protected-route": {
        price: "$0.10",
        network: "polygon-amoy", // 👈 Polygon Amoy testnet
        config: {
          description: "Access to premium content on Polygon Amoy",
        },
      },
    },

    {
      url: "https://facilitator.x402.rs", // 👈 Facilitator URL
    }
  )
);

// health check
app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
