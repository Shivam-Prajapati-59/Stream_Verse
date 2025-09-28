import express from "express";
import { paymentMiddleware } from "x402-express";
import cors from "cors";

const app = express();

// Enable CORS for frontend requests
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
}));

app.use(express.json());

// X402 Payment Middleware Configuration
const PAYMENT_RECEIVER = "0x6B66b8bcB45a802FA58bcC97521bb487BA36917f";
const FACILITATOR_URL = process.env.FACILITATOR_URL || "https://x402.polygon.technology";

app.use(paymentMiddleware(
    PAYMENT_RECEIVER,
    {
        // Video streaming endpoints with pay-per-chunk pricing
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
                        data: { type: "string", format: "binary", description: "Video chunk data" },
                        chunkInfo: {
                            type: "object",
                            properties: {
                                index: { type: "number" },
                                size: { type: "number" },
                                duration: { type: "number" }
                            }
                        }
                    }
                }
            }
        },

        // Video metadata endpoint (free)
        "GET /api/video/info": {
            price: "$0.000",
            network: "polygon-amoy",
            config: {
                description: "Get video metadata and chunk information",
                inputSchema: {
                    type: "object",
                    properties: {
                        commp: { type: "string", description: "Video COMMP/CID identifier" }
                    },
                    required: ["commp"]
                },
                outputSchema: {
                    type: "object",
                    properties: {
                        title: { type: "string" },
                        duration: { type: "number" },
                        totalChunks: { type: "number" },
                        chunkDuration: { type: "number" },
                        totalPrice: { type: "string" }
                    }
                }
            }
        }
    },
    {
        url: FACILITATOR_URL,
        // Enable detailed logging for development
        debug: process.env.NODE_ENV === "development"
    }
));

// Store for video data (in production, use a database)
const videoStore = new Map();

// Video chunk streaming endpoint - X402 payment required
app.get("/api/video/chunk", async (req, res) => {
    try {
        const { chunkIndex, commp } = req.query;

        if (!chunkIndex || !commp) {
            return res.status(400).json({
                error: "Missing required parameters: chunkIndex, commp"
            });
        }

        const chunkIdx = parseInt(chunkIndex, 10);

        // X402 middleware will handle payment verification before this point
        // If we reach here, payment has been successful and transaction hash is available

        // Extract payment information from X402 response headers
        const xPaymentResponse = req.headers['x-payment-response'];
        let transactionHash, payerAddress, paymentNetwork;

        if (xPaymentResponse) {
            try {
                // The x-payment-response header contains the payment details
                // It's likely base64 encoded, so we might need to decode it
                console.log("📄 Raw X-Payment-Response:", xPaymentResponse);

                // Try to parse if it's JSON
                const paymentData = JSON.parse(xPaymentResponse);
                transactionHash = paymentData.transaction;
                payerAddress = paymentData.payer;
                paymentNetwork = paymentData.network;

                console.log("✅ Parsed payment data:", paymentData);
            } catch (parseError) {
                console.error("❌ Could not parse X-Payment-Response:", parseError);
                // Fall back to checking req.payment object if available
                const paymentInfo = req.payment || {};
                transactionHash = paymentInfo.transaction || paymentInfo.transactionHash;
                payerAddress = paymentInfo.payer;
                paymentNetwork = paymentInfo.network;
            }
        } else {
            // Fall back to req.payment object set by x402-express middleware
            const paymentInfo = req.payment || {};
            transactionHash = paymentInfo.transaction || paymentInfo.transactionHash;
            payerAddress = paymentInfo.payer;
            paymentNetwork = paymentInfo.network;
        }

        if (!transactionHash) {
            console.error("❌ No transaction hash from X402 payment");
            console.error("Headers:", req.headers);
            console.error("Payment object:", req.payment);
            return res.status(402).json({
                error: "Payment required",
                message: "X402 payment failed or transaction hash not available"
            });
        }

        // Validate transaction hash format
        if (!/^0x[a-fA-F0-9]{64}$/.test(transactionHash)) {
            console.error("❌ Invalid transaction hash from X402:", transactionHash);
            return res.status(500).json({
                error: "Invalid transaction hash from payment processor"
            });
        }

        // In production, fetch from Synapse SDK or your storage
        // For demo, we'll simulate chunk data
        const chunkSize = 64 * 1024; // 64KB chunks
        const chunkData = Buffer.alloc(chunkSize, `chunk-${chunkIdx}-data`);

        console.log(`✅ X402 Payment verified for chunk ${chunkIdx} of video ${commp}`);
        console.log(`💰 Amount: $0.001 USDC`);
        console.log(`🌐 Network: polygon-amoy`);
        console.log(`🔗 Real TX Hash: ${transactionHash}`);
        console.log(`� Verify at: https://amoy.polygonscan.com/tx/${transactionHash}`);

        res.set({
            'Content-Type': 'application/octet-stream',
            'Content-Length': chunkSize.toString(),
            'X-Chunk-Index': chunkIndex.toString(),
            'X-Chunk-Size': chunkSize.toString(),
            'X-Video-CID': commp.toString(),
            'Cache-Control': 'public, max-age=86400',

            // Real payment headers from X402
            'X-Transaction-Hash': transactionHash,
            'X-Payment-Amount': '0.001',
            'X-Payment-Currency': 'USDC',
            'X-Payment-Network': paymentNetwork || 'polygon-amoy',
            'X-Payment-Timestamp': Date.now().toString(),
            'X-Payment-Verified': 'true',
            'X-Payment-Payer': payerAddress || 'unknown'
        });

        res.send(chunkData);

    } catch (error) {
        console.error("Error serving video chunk:", error);
        res.status(500).json({ error: "Failed to serve video chunk" });
    }
});

// Video info endpoint (metadata)
app.get("/api/video/info", (req, res) => {
    try {
        const { commp } = req.query;

        if (!commp) {
            return res.status(400).json({ error: "Missing commp parameter" });
        }

        // Simulated video metadata
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

    } catch (error) {
        console.error("Error serving video info:", error);
        res.status(500).json({ error: "Failed to get video info" });
    }
});

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        service: "StreamVerse Payment Server",
        network: "polygon-amoy"
    });
});

// Start server
const PORT = process.env.PORT || 4021;
app.listen(PORT, () => {
    console.log(`StreamVerse Payment Server running on port ${PORT}`);
    console.log(`Payment receiver: ${PAYMENT_RECEIVER}`);
    console.log(`Facilitator URL: ${FACILITATOR_URL}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});