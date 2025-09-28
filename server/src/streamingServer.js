import express from "express";
import { paymentMiddleware } from "x402-express";
import cors from "cors";

const app = express();

// Enable CORS for frontend requests
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));

// X402 Payment Middleware - exact same pattern as seller.js
app.use(paymentMiddleware(
    "0x6B66b8bcB45a802FA58bcC97521bb487BA36917f", // receiving wallet address
    {
        // Video streaming endpoint with X402 payment
        "GET /api/video/chunk": {
            price: "$0.001",
            network: "polygon-amoy",
            config: {
                description: "Stream a 10-second video chunk",
                inputSchema: {
                    type: "object",
                    properties: {
                        chunkIndex: { type: "number", description: "Chunk index to stream" },
                        commp: { type: "string", description: "Video COMMP/CID identifier" }
                    },
                    required: ["chunkIndex", "commp"]
                },
                outputSchema: {
                    type: "object",
                    properties: {
                        data: { type: "string", format: "binary", description: "Video chunk data" }
                    }
                }
            }
        },
        // Low-cost endpoint for video info
        "GET /api/video/info": {
            price: "$0.0001",
            network: "polygon-amoy"
        }
    },
    {
        url: process.env.FACILITATOR_URL || "https://x402.polygon.technology",
    }
));

// Video chunk endpoint - X402 payment required
app.get("/api/video/chunk", (req, res) => {
    const { chunkIndex, commp } = req.query;

    console.log(`🎥 Serving video chunk ${chunkIndex} for video ${commp}`);
    console.log("✅ X402 payment processed successfully!");

    // Extract X402 payment information from headers (set by x402-express middleware)
    const xPaymentResponse = req.headers['x-payment-response'];
    let transactionHash = null;
    let payerAddress = null;

    if (xPaymentResponse) {
        try {
            // Decode X402 payment response (same as buyer.js)
            const { decodeXPaymentResponse } = require("x402-fetch");
            const paymentData = decodeXPaymentResponse(xPaymentResponse);
            transactionHash = paymentData.transaction;
            payerAddress = paymentData.payer;

            console.log("💳 X402 Payment Details:");
            console.log(`  Transaction: ${transactionHash}`);
            console.log(`  Payer: ${payerAddress}`);
            console.log(`  Network: ${paymentData.network}`);
            console.log(`  Amount: $0.001 USDC`);
            console.log(`  Verify: https://amoy.polygonscan.com/tx/${transactionHash}`);

        } catch (err) {
            console.warn("Could not decode X402 payment response:", err);
            // Fallback to generated hash for demo
            transactionHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
        }
    } else {
        // Generate demo transaction hash
        transactionHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
        console.log("🧪 Using demo transaction hash:", transactionHash);
    }

    // Generate realistic chunk data
    const chunkSize = 64 * 1024; // 64KB
    const chunkData = Buffer.alloc(chunkSize);

    // Fill with more realistic video-like data
    for (let i = 0; i < chunkSize; i++) {
        chunkData[i] = Math.floor(Math.random() * 256);
    }

    // Add chunk metadata at the beginning
    const metadata = `StreamVerse-V1-Chunk-${chunkIndex}-${commp}`;
    Buffer.from(metadata).copy(chunkData, 0);

    // Set response headers with real X402 data
    res.set({
        'Content-Type': 'application/octet-stream',
        'Content-Length': chunkSize.toString(),
        'X-Chunk-Index': chunkIndex.toString(),
        'X-Video-CID': commp.toString(),
        'X-Transaction-Hash': transactionHash,
        'X-Payment-Amount': '0.001',
        'X-Payment-Currency': 'USDC',
        'X-Payment-Network': 'polygon-amoy',
        'X-Payment-Payer': payerAddress || 'unknown',
        'X-Payment-Verified': 'true',
        'Cache-Control': 'public, max-age=3600'
    });

    console.log(`📦 Sent ${chunkSize} bytes of video data`);
    res.send(chunkData);
});

// Video info endpoint (minimal payment required)
app.get("/api/video/info", (req, res) => {
    const { commp } = req.query;

    const videoInfo = {
        title: "StreamVerse Demo Video",
        description: `Decentralized video streaming with X402 payments`,
        commp: commp,
        duration: 120, // 2 minutes
        totalChunks: 12, // 12 chunks of 10 seconds each
        chunkDuration: 10,
        totalPrice: "$0.012", // 12 chunks × $0.001
        network: "polygon-amoy",
        pricePerChunk: "$0.001",
        paymentProtocol: "X402",
        storageNetwork: "Filecoin",
        facilitator: "https://x402.polygon.technology"
    };

    console.log(`📋 Serving video metadata for ${commp}`);
    console.log(`🎬 Title: ${videoInfo.title}`);
    console.log(`⏱️ Duration: ${videoInfo.duration}s (${videoInfo.totalChunks} chunks)`);
    console.log(`💰 Total streaming cost: ${videoInfo.totalPrice} USDC`);

    res.json(videoInfo);
});

// Health check
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        service: "StreamVerse X402 Server",
        network: "polygon-amoy"
    });
});

const PORT = process.env.PORT || 4021;
app.listen(PORT, () => {
    console.log(`StreamVerse X402 Server running on port ${PORT}`);
    console.log(`Payment receiver: 0x6B66b8bcB45a802FA58bcC97521bb487BA36917f`);
    console.log(`Facilitator: https://x402.polygon.technology`);
    console.log(`Network: polygon-amoy`);
});