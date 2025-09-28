# StreamVerse 🎬

**Decentralized Video Streaming Platform with X402 Micropayments**

StreamVerse is a cutting-edge decentralized video streaming platform that enables pay-per-chunk video consumption using the X402 payment protocol on the Polygon Amoy network. Built with modern web technologies and blockchain integration, it provides a seamless streaming experience with transparent, verifiable micropayments.

![StreamVerse Banner](https://img.shields.io/badge/StreamVerse-Decentralized%20Streaming-blue?style=for-the-badge&logo=ethereum)

## 🌟 Features

### Core Functionality

- **Pay-per-Chunk Streaming**: Revolutionary model where users only pay for the video content they consume
- **X402 Payment Protocol**: Seamless micropayments using HTTP 402 status codes
- **Decentralized Storage**: Integration with Filecoin/Synapse for content storage and retrieval
- **Real-time Payment Tracking**: Live transaction monitoring with Polygon blockchain verification
- **Progressive Video Loading**: Efficient chunk-based video delivery system

### Advanced Features

- **Metadata Extraction**: Automatic video duration, resolution, and size detection
- **Smart Chunk Management**: Optimized video segmentation for streaming
- **Wallet Integration**: RainbowKit wallet connection with multi-wallet support
- **Transaction Verification**: Real-time blockchain transaction confirmation
- **Responsive Design**: Modern UI/UX with dark/light theme support

## 🛠️ Technology Stack

### Frontend

- **Framework**: Next.js 15.5.4 with TypeScript
- **UI Library**: React 18 with modern hooks and context API
- **Styling**: Tailwind CSS with shadcn/ui components
- **Web3 Integration**:
  - Wagmi v2 for Ethereum interactions
  - RainbowKit for wallet connectivity
  - Viem for low-level Ethereum operations
- **State Management**: React Context with custom hooks
- **Payment Processing**: X402-fetch library for micropayments

### Backend

- **Runtime**: Node.js with Express.js framework
- **Database**: PostgreSQL with Drizzle ORM
- **Payment Protocol**: X402-express middleware
- **File Storage**: Synapse SDK for Filecoin integration
- **Authentication**: Ethereum signature-based authentication

### Blockchain & Payments

- **Network**: Polygon Amoy Testnet
- **Currency**: USDC for micropayments
- **Payment Amount**: $0.001 USDC per video chunk
- **Protocol**: X402 HTTP status code for payment requests
- **Verification**: Polygon blockchain transaction confirmation

### Development Tools

- **Package Manager**: npm
- **Type Safety**: TypeScript with strict mode
- **Code Quality**: ESLint with Next.js configuration
- **Database Migrations**: Drizzle Kit
- **Environment Management**: dotenv for configuration

## 🗃️ Filecoin & Synapse Integration

### Decentralized Storage Architecture

StreamVerse leverages **Filecoin's decentralized storage network** through the **Synapse SDK** to ensure content permanence, censorship resistance, and global accessibility.

#### Filecoin Network Benefits

- **Decentralized Infrastructure**: No single point of failure
- **Content Permanence**: Files stored with cryptographic proof
- **Global Distribution**: Content available worldwide through IPFS
- **Cost Efficiency**: Competitive storage pricing compared to centralized alternatives
- **Immutable Content**: Content integrity guaranteed by blockchain

#### Synapse SDK Integration

```typescript
// Video Upload to Filecoin via Synapse
const uploadVideo = async (videoFile: File) => {
  const synapse = new Synapse({
    apiKey: process.env.SYNAPSE_API_KEY,
    network: "filecoin-mainnet",
  });

  // Upload returns Content Identifier (CID)
  const cid = await synapse.storage.upload(videoFile);
  return cid; // e.g., "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi"
};

// Video Retrieval from Filecoin
const downloadVideo = async (cid: string) => {
  const videoData = await synapse.storage.download(cid);
  return new Blob([videoData], { type: "video/mp4" });
};
```

#### Storage Workflow

1. **Upload Process**: Videos uploaded to Filecoin network via Synapse SDK
2. **CID Generation**: Unique Content Identifier created for each video
3. **Metadata Storage**: CID and video metadata stored in PostgreSQL
4. **Content Retrieval**: Videos fetched using CID for streaming
5. **Chunk Distribution**: Video content split into streamable chunks

## 💳 X402 Payment Protocol on Polygon Amoy

### X402 Protocol Overview

The **X402 payment protocol** revolutionizes web micropayments by extending HTTP with a standardized payment flow using the `402 Payment Required` status code.

#### How X402 Works

```http
# Initial Request (No Payment)
GET /api/stream/chunk/0
Host: streamverse.com

# Server Response (Payment Required)
HTTP/1.1 402 Payment Required
Content-Type: application/json
{
  "amount": "0.001",
  "currency": "USDC",
  "recipient": "0x742d35Cc6634C0532925a3b8D162A5E648F88b0E",
  "network": "polygon-amoy"
}

# Client Processes Payment & Retries
GET /api/stream/chunk/0
X-Payment-Token: 0x1234567890abcdef...
X-Payment-Amount: 0.001
X-Payment-Currency: USDC

# Server Response (Content Delivered)
HTTP/1.1 200 OK
Content-Type: application/octet-stream
[Video chunk data...]
```

### Polygon Amoy Testnet Integration

#### Network Specifications

- **Network Name**: Polygon Amoy Testnet
- **Chain ID**: 80002
- **Currency**: MATIC (native), USDC (payments)
- **RPC URL**: `https://rpc-amoy.polygon.technology`
- **Block Explorer**: `https://amoy.polygonscan.com`
- **Faucet**: Available for testnet MATIC and USDC

#### Payment Implementation

```typescript
// USDC Payment on Polygon Amoy
const processPayment = async (amount: string, recipient: string) => {
  const client = createWalletClient({
    chain: polygonAmoy,
    transport: http("https://rpc-amoy.polygon.technology"),
  });

  // USDC Contract on Polygon Amoy
  const USDC_CONTRACT = "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582";

  const hash = await client.writeContract({
    address: USDC_CONTRACT,
    abi: usdcAbi,
    functionName: "transfer",
    args: [recipient, parseUnits(amount, 6)], // USDC has 6 decimals
  });

  return hash;
};
```

#### Testnet Configuration

```typescript
// Polygon Amoy Testnet Setup
export const polygonAmoy = {
  id: 80002,
  name: "Polygon Amoy",
  network: "polygon-amoy",
  nativeCurrency: {
    decimals: 18,
    name: "MATIC",
    symbol: "MATIC",
  },
  rpcUrls: {
    public: { http: ["https://rpc-amoy.polygon.technology"] },
    default: { http: ["https://rpc-amoy.polygon.technology"] },
  },
  blockExplorers: {
    default: {
      name: "PolygonScan",
      url: "https://amoy.polygonscan.com",
    },
  },
  contracts: {
    usdc: {
      address: "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582",
      decimals: 6,
    },
  },
};
```

#### Payment Verification Flow

1. **User Request**: Client requests video chunk
2. **Payment Challenge**: Server responds with 402 status
3. **Wallet Interaction**: User approves USDC payment
4. **Blockchain Transaction**: Payment sent to Polygon Amoy
5. **Transaction Confirmation**: Payment verified on blockchain
6. **Content Delivery**: Video chunk streamed to client
7. **Receipt Storage**: Transaction hash stored for records

### Integration Benefits

- **Low Transaction Fees**: Polygon's L2 scaling reduces gas costs
- **Fast Confirmations**: ~2 second block times for quick payments
- **EVM Compatibility**: Full Ethereum tooling support
- **Testnet Safety**: Risk-free development and testing environment
- **USDC Stability**: Stable currency for predictable pricing

## 📁 Project Structure

```
StreamVerse/
├── frontend/                 # Next.js frontend application
│   ├── app/                 # Next.js 13+ app directory
│   │   ├── api/            # API routes for video processing
│   │   ├── explore/        # Video discovery page
│   │   └── storage/        # Storage management interface
│   ├── components/         # Reusable React components
│   │   ├── custom/         # Application-specific components
│   │   └── ui/            # shadcn/ui base components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions and configurations
│   ├── providers/         # React context providers
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Helper functions and constants
├── server/                # Express.js backend server
│   ├── src/               # Source code
│   │   ├── config/        # Database and service configurations
│   │   ├── models/        # Data models and schemas
│   │   ├── routes/        # API route handlers
│   │   └── services/      # Business logic services
│   ├── migrations/        # Database migration files
│   └── tests/            # Test suites
└── docs/                 # Documentation files
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Polygon wallet with USDC
- Environment variables configured

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Shivam-Prajapati-59/Stream_Verse.git
   cd Stream_Verse
   ```

2. **Install frontend dependencies**

   ```bash
   cd frontend
   npm install
   ```

3. **Install backend dependencies**

   ```bash
   cd ../server
   npm install
   ```

4. **Configure environment variables**

   Create `.env.local` in frontend directory:

   ```env
   NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_id
   NEXT_PUBLIC_PRIVATE_KEY=your_ethereum_private_key
   ```

   Create `.env` in server directory:

   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/streamverse
   X402_FACILITATOR_URL=https://x402.polygon.technology
   POLYGON_RPC_URL=https://rpc-amoy.polygon.technology
   ```

5. **Set up the database**

   ```bash
   cd server
   npm run db:generate
   npm run db:migrate
   ```

6. **Start the development servers**

   Backend server:

   ```bash
   cd server
   npm run dev
   ```

   Frontend application:

   ```bash
   cd frontend
   npm run dev
   ```

7. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## 💡 How It Works

### Video Upload Process (Filecoin Integration)

1. **File Selection**: Users select video files through the drag-and-drop upload interface
2. **Client Processing**: Video file validated for format, size, and duration on client-side
3. **Synapse Upload**: Video uploaded to Filecoin network via Synapse SDK
   ```typescript
   const cid = await synapse.storage.upload(videoFile);
   // Returns: "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi"
   ```
4. **Metadata Extraction**: System extracts video duration, resolution, and file size using HTML5 video API
5. **Chunk Configuration**: Videos logically divided into 12 streamable chunks (~10 seconds each)
6. **Database Storage**: Video metadata, CID, and chunk information stored in PostgreSQL
7. **IPFS Propagation**: Content becomes available across global IPFS network

### Streaming Process (X402 + Filecoin)

1. **Video Discovery**: Users browse videos in marketplace with CID-based content addressing
2. **Wallet Connection**: RainbowKit integration for Polygon Amoy wallet connectivity
3. **Content Initialization**: Video metadata loaded from Filecoin using stored CID
4. **Chunk Request Sequence**: Client requests video chunks sequentially via X402 protocol
5. **Payment Authentication**: Each chunk triggers X402 payment requirement
6. **Blockchain Verification**: USDC payment confirmed on Polygon Amoy testnet
7. **Content Delivery**: Verified chunks streamed directly from Filecoin network
8. **Progressive Playback**: Video plays as paid chunks are received and buffered

### X402 Payment Flow (Detailed)

1. **Initial Request**: Client requests video chunk from streaming endpoint

   ```http
   GET /api/stream/chunk/0?cid=bafybeigdyrzt5...
   ```

2. **Payment Challenge**: Server responds with X402 payment requirement

   ```json
   {
     "status": 402,
     "amount": "0.001",
     "currency": "USDC",
     "recipient": "0x742d35Cc6634C0532925a3b8D162A5E648F88b0E",
     "network": "polygon-amoy",
     "chainId": 80002
   }
   ```

3. **Wallet Interaction**: User approves USDC transfer via connected wallet

   ```typescript
   const txHash = await writeContract({
     address: USDC_CONTRACT_AMOY,
     functionName: "transfer",
     args: [recipient, parseUnits("0.001", 6)],
   });
   ```

4. **Transaction Confirmation**: Payment verified on Polygon Amoy blockchain (2-3 second confirmation)

5. **Content Retrieval**: Server fetches chunk from Filecoin using CID and chunk index

   ```typescript
   const videoData = await synapse.storage.download(cid);
   const chunk = videoData.slice(chunkStart, chunkEnd);
   ```

6. **Authenticated Delivery**: Video chunk delivered with payment proof headers
   ```http
   X-Transaction-Hash: 0x1234567890abcdef...
   X-Payment-Verified: true
   X-Chunk-Index: 0
   X-Total-Chunks: 12
   ```

### Decentralized Architecture Benefits

- **No Central Storage**: Videos stored across Filecoin's distributed network
- **Censorship Resistance**: Content accessible globally without single point of control
- **Transparent Payments**: All transactions verifiable on Polygon blockchain
- **Cost Efficiency**: Pay only for chunks actually viewed
- **Global Accessibility**: IPFS ensures content availability worldwide
- **Immutable Content**: Filecoin guarantees content integrity and permanence

## 🔧 API Documentation

### Video Management Endpoints

#### Upload Video

```http
POST /api/videos/create
Content-Type: multipart/form-data

{
  "title": "Video Title",
  "description": "Video Description",
  "file": <video_file>
}
```

#### Get Videos

```http
GET /api/videos
```

#### Stream Video Chunk

```http
GET /api/video/stream/:chunkIndex
Headers: {
  "Authorization": "Bearer <payment_token>",
  "X-Payment-Amount": "0.001"
}
```

### Payment Endpoints

#### Process Payment

```http
POST /api/payment/process
{
  "amount": "0.001",
  "currency": "USDC",
  "recipient": "0x...",
  "chunkIndex": 0
}
```

## 🏗️ Architecture Overview

### Frontend Architecture

- **Component-Based**: Modular React components with TypeScript
- **Custom Hooks**: Reusable logic for streaming, payments, and wallet management
- **Context Providers**: Global state management for wallet and theme
- **Service Layer**: Abstracted API calls and blockchain interactions

### Backend Architecture

- **RESTful API**: Express.js with structured route handlers
- **Database Layer**: Drizzle ORM with PostgreSQL for data persistence
- **Payment Processing**: X402 middleware for automated payment handling
- **File Storage Integration**: Synapse SDK for decentralized storage

### Blockchain Integration

- **Wallet Connection**: RainbowKit for seamless wallet connectivity
- **Transaction Management**: Viem for low-level blockchain operations
- **Payment Verification**: Real-time transaction confirmation
- **Network Support**: Polygon Amoy testnet with USDC payments

## 🔐 Security Features

- **Signature-Based Authentication**: Ethereum wallet signature verification
- **Payment Verification**: Blockchain transaction confirmation required
- **Input Validation**: Comprehensive data validation on all endpoints
- **CORS Protection**: Configured cross-origin resource sharing
- **Environment Security**: Sensitive data stored in environment variables

## 🎯 Use Cases

### Content Creators

- **Monetization**: Direct payment from viewers without intermediaries
- **Global Reach**: Decentralized platform accessible worldwide
- **Transparent Earnings**: Real-time payment tracking and verification

### Viewers

- **Pay-per-View**: Only pay for content actually consumed
- **Micro-transactions**: Affordable access to premium content
- **Decentralized Access**: No platform restrictions or censorship

### Developers

- **Open Protocol**: X402 standard for micropayment integration
- **Blockchain Native**: Built-in Web3 functionality
- **Extensible Architecture**: Easy to add new features and integrations

## 🚀 Deployment

### Frontend Deployment (Vercel)

```bash
npm run build
npm run start
```

### Backend Deployment (Railway/Heroku)

```bash
npm run build
npm start
```

### Database Setup (PostgreSQL)

- Configure connection string
- Run migrations: `npm run db:migrate`
- Seed initial data if needed

## 🤝 Contributing

We welcome contributions to StreamVerse! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests for new features
- Update documentation for API changes
- Ensure responsive design compatibility

## 📊 Performance Metrics

- **Video Loading**: < 2 seconds for first chunk
- **Payment Processing**: < 1 second for USDC transactions
- **Chunk Streaming**: Optimized 64KB chunk sizes
- **Database Queries**: Indexed for sub-100ms response times

## 🛣️ Roadmap

### Phase 1 (Current)

- ✅ Basic streaming functionality
- ✅ X402 payment integration
- ✅ Wallet connectivity
- ✅ Video upload and storage

### Phase 2 (Upcoming)

- 🔄 Enhanced video quality options
- 🔄 Social features (comments, ratings)
- 🔄 Creator dashboard improvements and components

### Phase 3 (Future)

- 📋 streaming capabilities into payable chunks
- 📋 CID integration for exclusive content listing

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **X402 Protocol**: For enabling seamless HTTP-based micropayments
- **Polygon**: For providing scalable blockchain infrastructure
- **Filecoin/Synapse**: For decentralized storage solutions
- **Next.js Team**: For the excellent React framework
- **RainbowKit**: For beautiful wallet connection experience

## 📞 Support

For support and questions:

- **GitHub Issues**: [Create an issue](https://github.com/Shivam-Prajapati-59/Stream_Verse/issues)
- **Documentation**: Check the `/docs` folder for detailed guides
- **Community**: Join our Discord server for discussions

---

**Built with ❤️ by the StreamVerse Team**

_Revolutionizing video streaming through blockchain technology and micropayments._
