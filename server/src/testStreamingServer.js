import express from "express";
import cors from "cors";

const app = express();

// Enable CORS for frontend requests
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));

// Test video chunk endpoint (no payment required for testing)
app.get("/api/video/chunk", (req, res) => {
    const { chunkIndex, commp } = req.query;

    console.log(`🎥 Serving video chunk ${chunkIndex} for video ${commp} (TEST MODE)`);

    // Generate sample chunk data
    const chunkSize = 64 * 1024; // 64KB
    const chunkData = Buffer.alloc(chunkSize, `chunk-${chunkIndex}-data`);

    // Simulate X402 payment success headers
    res.set({
        'Content-Type': 'application/octet-stream',
        'Content-Length': chunkSize.toString(),
        'X-Chunk-Index': chunkIndex.toString(),
        'X-Video-CID': commp.toString(),
        // Simulate real transaction hash for testing
        'X-Transaction-Hash': '0x3fd8f29dccdc0b881a6b0711280a612bcad9e43600d2b4516298bf613162ee58',
        'X-Payment-Amount': '0.001',
        'X-Payment-Currency': 'USDC',
        'X-Payment-Network': 'polygon-amoy',
        'X-Payment-Verified': 'true'
    });

    res.send(chunkData);
});

// Video info endpoint
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

    console.log(`📋 Serving video info for ${commp} (TEST MODE)`);
    res.json(videoInfo);
});

// Health check
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        service: "StreamVerse Test Server (No X402)",
        network: "polygon-amoy"
    });
});

const PORT = process.env.PORT || 4022;
app.listen(PORT, () => {
    console.log(`🧪 StreamVerse Test Server running on port ${PORT}`);
    console.log(`🚀 This server simulates successful X402 payments for testing`);
    console.log(`💡 Switch to port 4021 for real X402 payments`);
});