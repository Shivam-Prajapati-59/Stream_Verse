# StreamVerse 🎬

**Decentralized Video Streaming with X402 Micropayments**

Pay-per-chunk video streaming platform using X402 payment protocol on Polygon Amoy testnet with Filecoin storage.

## ✨ Key Features

- **Pay-per-Chunk**: Users pay $0.001 USDC only for video chunks they watch
- **X402 Protocol**: HTTP 402 status code enables seamless web micropayments
- **Filecoin Storage**: Videos stored on decentralized Filecoin network via Synapse SDK
- **Polygon Payments**: Fast, cheap USDC payments on Polygon Amoy testnet
- **Real-time Streaming**: Progressive video loading with blockchain payment verification

## 🛠️ Tech Stack

**Frontend**: Next.js 15, TypeScript, Tailwind CSS, Wagmi, RainbowKit
**Backend**: Node.js, Express, PostgreSQL, Drizzle ORM
**Blockchain**: Polygon Amoy Testnet, USDC payments, X402 protocol
**Storage**: Filecoin network via Synapse SDK
**Payments**: X402-express middleware, X402-fetch client

## 🏗️ How It Works

### Upload Process

1. Upload video via web interface
2. Store on Filecoin via Synapse SDK (gets CID)
3. Split into 12 chunks for streaming
4. Save metadata to PostgreSQL

### Streaming Process

1. User selects video from marketplace
2. Connect wallet (RainbowKit + Wagmi)
3. Request video chunk → Server returns HTTP 402
4. Pay $0.001 USDC on Polygon Amoy → Get transaction hash
5. Retry request with payment proof → Receive video chunk
6. Repeat for each chunk as video plays

### X402 Payment Flow

```http
GET /api/stream/chunk/0
→ 402 Payment Required {"amount": "0.001", "currency": "USDC"}
→ User pays via wallet
→ GET /api/stream/chunk/0 + X-Payment-Token: 0x123...
→ 200 OK + video chunk data
```

## � Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- MetaMask wallet

### Quick Start

```bash
# Clone repo
git clone <repo-url>
cd eth_delhi

# Setup Backend
cd server
npm install
# Create .env with DATABASE_URL, SYNAPSE_API_KEY, PRIVATE_KEY
npm run db:migrate
npm run dev  # Port 3001

# Setup Frontend
cd frontend
npm install
# Create .env.local with NEXT_PUBLIC_SYNAPSE_API_KEY, NEXT_PUBLIC_PRIVATE_KEY
npm run dev  # Port 3000

# Demo Server (for X402 simulation)
cd server
node demoStreamingServer.js  # Port 3002
```

### Environment Variables

**Frontend (.env.local):**

```env
NEXT_PUBLIC_SYNAPSE_API_KEY=your_key
NEXT_PUBLIC_PRIVATE_KEY=your_private_key
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
```

**Backend (.env):**

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/streamverse_db
SYNAPSE_API_KEY=your_key
PRIVATE_KEY=your_private_key
```

### Wallet Setup

1. Add Polygon Amoy testnet to MetaMask
   - Chain ID: 80002
   - RPC: `https://rpc-amoy.polygon.technology`
2. Get testnet MATIC and USDC from faucets

## 🎯 What We Built

A complete decentralized video streaming platform that combines:

- **Filecoin storage** for permanent video hosting
- **X402 micropayments** for pay-per-chunk streaming
- **Polygon Amoy** for fast, cheap blockchain transactions
- **Web3 wallet integration** for seamless user experience

This demonstrates how blockchain can enable new monetization models for content creators while providing affordable access for viewers.

---

**Ready for Demo! 🚀**

Built for ETH Delhi hackathon - showcasing the future of decentralized video streaming.
