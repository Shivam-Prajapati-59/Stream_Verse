import express from 'express';
import { VideoService } from '../services/videoService.js';

const router = express.Router();

// GET /api/videos - Get all videos
router.get('/', async (req, res) => {
    try {
        const videos = await VideoService.getAllVideos();
        res.json({
            success: true,
            data: videos,
            count: videos.length
        });
    } catch (error) {
        console.error('Error fetching videos:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch videos',
            message: error.message
        });
    }
});

// GET /api/videos/:id - Get video by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const video = await VideoService.getVideoById(parseInt(id));

        if (!video) {
            return res.status(404).json({
                success: false,
                error: 'Video not found'
            });
        }

        res.json({
            success: true,
            data: video
        });
    } catch (error) {
        console.error('Error fetching video:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch video',
            message: error.message
        });
    }
});

// GET /api/videos/address/:address - Get videos by public address
router.get('/address/:address', async (req, res) => {
    try {
        const { address } = req.params;
        const videos = await VideoService.getVideosByAddress(address);

        res.json({
            success: true,
            data: videos,
            count: videos.length
        });
    } catch (error) {
        console.error('Error fetching videos by address:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch videos by address',
            message: error.message
        });
    }
});

// GET /api/videos/cid/:cid - Get video by CID
router.get('/cid/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const video = await VideoService.getVideoByCid(cid);

        if (!video) {
            return res.status(404).json({
                success: false,
                error: 'Video with this CID not found'
            });
        }

        res.json({
            success: true,
            data: video
        });
    } catch (error) {
        console.error('Error fetching video by CID:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch video by CID',
            message: error.message
        });
    }
});

// POST /api/videos - Create a new video
router.post('/', async (req, res) => {
    try {
        const { publicAddress, title, description, cid, tags } = req.body;

        // Validation
        if (!publicAddress || !title || !cid) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                required: ['publicAddress', 'title', 'cid']
            });
        }

        // Validate Ethereum address format
        if (!/^0x[a-fA-F0-9]{40}$/.test(publicAddress)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid Ethereum address format'
            });
        }

        // Validate tags array
        if (tags && !Array.isArray(tags)) {
            return res.status(400).json({
                success: false,
                error: 'Tags must be an array'
            });
        }

        const video = await VideoService.createVideo({
            publicAddress,
            title,
            description: description || null,
            cid,
            tags: tags || []
        });

        res.status(201).json({
            success: true,
            data: video,
            message: 'Video created successfully'
        });
    } catch (error) {
        console.error('Error creating video:', error);

        // Handle unique constraint violations
        if (error.code === '23505') {
            return res.status(409).json({
                success: false,
                error: 'Video with this CID already exists'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Failed to create video',
            message: error.message
        });
    }
});

// PUT /api/videos/:id - Update video
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, tags } = req.body;

        // Validate tags array if provided
        if (tags && !Array.isArray(tags)) {
            return res.status(400).json({
                success: false,
                error: 'Tags must be an array'
            });
        }

        const updates = {};
        if (title !== undefined) updates.title = title;
        if (description !== undefined) updates.description = description;
        if (tags !== undefined) updates.tags = tags;

        const video = await VideoService.updateVideo(parseInt(id), updates);

        if (!video) {
            return res.status(404).json({
                success: false,
                error: 'Video not found'
            });
        }

        res.json({
            success: true,
            data: video,
            message: 'Video updated successfully'
        });
    } catch (error) {
        console.error('Error updating video:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update video',
            message: error.message
        });
    }
});

// DELETE /api/videos/:id - Delete video
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await VideoService.deleteVideo(parseInt(id));

        if (!deleted) {
            return res.status(404).json({
                success: false,
                error: 'Video not found'
            });
        }

        res.json({
            success: true,
            message: 'Video deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting video:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete video',
            message: error.message
        });
    }
});

export default router;