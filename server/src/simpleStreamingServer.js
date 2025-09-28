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

    console.log(`Serving video chunk ${chunkIndex} for video ${commp}`);
    console.log("X402 payment processed successfully!");

    // Generate sample chunk data
    const chunkSize = 64 * 1024; // 64KB
    const chunkData = Buffer.alloc(chunkSize, `chunk-${chunkIndex}-data`);

    // Set response headers
    res.set({
        'Content-Type': 'application/octet-stream',
        'Content-Length': chunkSize.toString(),
        'X-Chunk-Index': chunkIndex.toString(),
        'X-Video-CID': commp.toString(),
        'X-Transaction-Hash': 'TX_HASH_FROM_X402', // This will be set by X402 middleware
        'X-Payment-Amount': '0.001',
        'X-Payment-Currency': 'USDC',
        'X-Payment-Network': 'polygon-amoy',
        'X-Payment-Verified': 'true'
    });

    res.send(chunkData);
});

// Video info endpoint (free)
app.get("/api/video/info", (req, res) => {
    const { commp } = req.query;

    const videoInfo = {
        title: `Video ${commp}`,
        duration: 120, // 2 minutes
        totalChunks: 12, // 12 chunks of 10 seconds each
        chunkDuration: 10,
        totalPrice: "$0.012", // 12 chunks × $0.001
        network: "polygon-amoy",
        pricePerChunk: "$0.001"
    };

    console.log(`Serving video info for ${commp}`);
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