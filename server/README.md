# Stream Verse Server

A decentralized video platform backend with PostgreSQL database, IPFS integration, and X402 micropayments.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your values

# Set up database
npm run db:push

# Start the server
npm run server
```

## Project Structure

```
server/
├── src/
│   ├── config/           # Configuration files
│   ├── models/           # Database schemas
│   ├── services/         # Business logic
│   ├── routes/           # API routes
│   ├── server.js         # Main server
│   ├── buyer.js          # Payment client
│   └── seller.js         # Payment server
├── tests/                # Test files
├── docs/                 # Documentation
└── migrations/           # Database migrations
```

## Available Scripts

| Command            | Description              |
| ------------------ | ------------------------ |
| `npm run server`   | Start main API server    |
| `npm run buyer`    | Start payment client     |
| `npm run seller`   | Start payment server     |
| `npm run db:push`  | Push database schema     |
| `npm run test:api` | Test API endpoints       |
| `npm run test:db`  | Test database operations |

## API Endpoints

- `GET /health` - Health check
- `GET /api/videos` - Get all videos
- `POST /api/videos` - Create video
- `GET /api/videos/:id` - Get video by ID
- `PUT /api/videos/:id` - Update video
- `DELETE /api/videos/:id` - Delete video
- `GET /api/videos/address/:address` - Get videos by address
- `GET /api/videos/cid/:cid` - Get video by CID

## Documentation

- [Complete Documentation](./docs/README.md)
- [API Reference](./docs/API.md)

## Features

✅ RESTful API  
✅ PostgreSQL with Drizzle ORM  
✅ IPFS integration  
✅ Ethereum address validation  
✅ X402 micropayments  
✅ CORS enabled  
✅ Comprehensive error handling  
✅ Input validation

## Tech Stack

- **Node.js** - Runtime
- **Express.js** - Web framework
- **Neon PostgreSQL** - Database
- **Drizzle ORM** - Database ORM
- **X402** - Micropayment protocol
- **IPFS** - Content storage

## Environment Variables

```env
DATABASE_URL=postgresql://...
PRIVATE_KEY=your_private_key
FACILITATOR_URL=https://x402.polygon.technology
PAYMENT_ADDRESS=0x...
PORT=3001
```

## License

MIT
