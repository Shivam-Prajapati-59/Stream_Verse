import { db, schema } from '../config/database.js';
import { eq, sql } from 'drizzle-orm';

const { videos } = schema;

// Database operations for videos
export class VideoService {

    // Create a new video record
    static async createVideo({ publicAddress, title, description, cid, tags = [] }) {
        try {
            const result = await db.insert(videos).values({
                publicAddress,
                title,
                description,
                cid,
                tags: JSON.stringify(tags), // Convert array to JSON string
            }).returning();

            return result[0];
        } catch (error) {
            console.error('Error creating video:', error);
            throw error;
        }
    }

    // Get all videos
    static async getAllVideos() {
        try {
            const result = await db.select().from(videos);
            return result.map(video => ({
                ...video,
                tags: typeof video.tags === 'string' ? JSON.parse(video.tags) : video.tags
            }));
        } catch (error) {
            console.error('Error fetching videos:', error);
            throw error;
        }
    }

    // Get videos by public address
    static async getVideosByAddress(publicAddress) {
        try {
            const result = await db.select()
                .from(videos)
                .where(eq(videos.publicAddress, publicAddress));

            return result.map(video => ({
                ...video,
                tags: typeof video.tags === 'string' ? JSON.parse(video.tags) : video.tags
            }));
        } catch (error) {
            console.error('Error fetching videos by address:', error);
            throw error;
        }
    }

    // Get video by ID
    static async getVideoById(id) {
        try {
            const result = await db.select()
                .from(videos)
                .where(eq(videos.id, id));

            if (result.length === 0) return null;

            const video = result[0];
            return {
                ...video,
                tags: typeof video.tags === 'string' ? JSON.parse(video.tags) : video.tags
            };
        } catch (error) {
            console.error('Error fetching video by ID:', error);
            throw error;
        }
    }

    // Get video by CID
    static async getVideoByCid(cid) {
        try {
            const result = await db.select()
                .from(videos)
                .where(eq(videos.cid, cid));

            if (result.length === 0) return null;

            const video = result[0];
            return {
                ...video,
                tags: typeof video.tags === 'string' ? JSON.parse(video.tags) : video.tags
            };
        } catch (error) {
            console.error('Error fetching video by CID:', error);
            throw error;
        }
    }

    // Update video
    static async updateVideo(id, updates) {
        try {
            // If tags are provided, convert to JSON string
            if (updates.tags && Array.isArray(updates.tags)) {
                updates.tags = JSON.stringify(updates.tags);
            }

            const result = await db.update(videos)
                .set({ ...updates, updatedAt: new Date() })
                .where(eq(videos.id, id))
                .returning();

            if (result.length === 0) return null;

            const video = result[0];
            return {
                ...video,
                tags: typeof video.tags === 'string' ? JSON.parse(video.tags) : video.tags
            };
        } catch (error) {
            console.error('Error updating video:', error);
            throw error;
        }
    }

    // Delete video
    static async deleteVideo(id) {
        try {
            const result = await db.delete(videos)
                .where(eq(videos.id, id))
                .returning();

            return result.length > 0;
        } catch (error) {
            console.error('Error deleting video:', error);
            throw error;
        }
    }

    // Search videos by title (bonus method)
    static async searchVideosByTitle(searchTerm) {
        try {
            const result = await db.select()
                .from(videos)
                .where(
                    // Using SQL ILIKE for case-insensitive search
                    sql`${videos.title} ILIKE ${`%${searchTerm}%`}`
                );

            return result.map(video => ({
                ...video,
                tags: typeof video.tags === 'string' ? JSON.parse(video.tags) : video.tags
            }));
        } catch (error) {
            console.error('Error searching videos by title:', error);
            throw error;
        }
    }

    // Get videos with pagination (bonus method)
    static async getVideosWithPagination(page = 1, limit = 10) {
        try {
            const offset = (page - 1) * limit;

            const result = await db.select()
                .from(videos)
                .limit(limit)
                .offset(offset)
                .orderBy(videos.createdAt);

            const total = await db.select({ count: sql`count(*)` }).from(videos);

            return {
                videos: result.map(video => ({
                    ...video,
                    tags: typeof video.tags === 'string' ? JSON.parse(video.tags) : video.tags
                })),
                pagination: {
                    page,
                    limit,
                    total: parseInt(total[0].count),
                    totalPages: Math.ceil(parseInt(total[0].count) / limit)
                }
            };
        } catch (error) {
            console.error('Error fetching videos with pagination:', error);
            throw error;
        }
    }

    // Get videos by tag (bonus method)
    static async getVideosByTag(tag) {
        try {
            const result = await db.select()
                .from(videos)
                .where(
                    // Using JSON contains operator
                    sql`${videos.tags}::jsonb @> ${JSON.stringify([tag])}`
                );

            return result.map(video => ({
                ...video,
                tags: typeof video.tags === 'string' ? JSON.parse(video.tags) : video.tags
            }));
        } catch (error) {
            console.error('Error fetching videos by tag:', error);
            throw error;
        }
    }

    // Get video statistics (bonus method)
    static async getVideoStats() {
        try {
            const totalVideos = await db.select({ count: sql`count(*)` }).from(videos);
            const uniqueAddresses = await db.select({ count: sql`count(DISTINCT public_address)` }).from(videos);
            const recentVideos = await db.select({ count: sql`count(*)` })
                .from(videos)
                .where(sql`${videos.createdAt} >= NOW() - INTERVAL '7 days'`);

            return {
                totalVideos: parseInt(totalVideos[0].count),
                uniqueCreators: parseInt(uniqueAddresses[0].count),
                recentVideos: parseInt(recentVideos[0].count)
            };
        } catch (error) {
            console.error('Error fetching video statistics:', error);
            throw error;
        }
    }
}