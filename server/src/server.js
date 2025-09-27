import express from 'express';
import videoRoutes from './routes/videos.js';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware (for frontend integration)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Health check route
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Stream Verse API Server is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// API routes
app.use('/api/videos', videoRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: err.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        message: `${req.method} ${req.originalUrl} not found`
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Stream Verse API Server running on http://localhost:${PORT}`);
    console.log(`📊 API Endpoints:`);
    console.log(`   GET    http://localhost:${PORT}/api/videos`);
    console.log(`   POST   http://localhost:${PORT}/api/videos`);
    console.log(`   GET    http://localhost:${PORT}/api/videos/:id`);
    console.log(`   PUT    http://localhost:${PORT}/api/videos/:id`);
    console.log(`   DELETE http://localhost:${PORT}/api/videos/:id`);
    console.log(`   GET    http://localhost:${PORT}/api/videos/address/:address`);
    console.log(`   GET    http://localhost:${PORT}/api/videos/cid/:cid`);
    console.log(`   GET    http://localhost:${PORT}/health`);
});

export default app;