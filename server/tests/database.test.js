import { VideoService } from '../src/services/videoService.js';

// Example usage function (for testing)
export async function testDatabaseOperations() {
    try {
        console.log('🧪 Testing database operations...');

        // Create a test video
        const newVideo = await VideoService.createVideo({
            publicAddress: '0x742D35CC6635C0532925a3B8D05E51E4F7C4CE77',
            title: 'Database Test Video',
            description: 'This is a test video for database operations',
            cid: 'QmTestDatabaseCID123456789',
            tags: ['database', 'test', 'video']
        });

        console.log('✅ Created video:', newVideo);

        // Get all videos
        const allVideos = await VideoService.getAllVideos();
        console.log('✅ All videos count:', allVideos.length);

        // Get videos by address
        const userVideos = await VideoService.getVideosByAddress('0x742D35CC6635C0532925a3B8D05E51E4F7C4CE77');
        console.log('✅ User videos count:', userVideos.length);

        // Get video by ID
        if (newVideo.id) {
            const videoById = await VideoService.getVideoById(newVideo.id);
            console.log('✅ Video by ID:', videoById?.title);
        }

        // Get video by CID
        const videoByCid = await VideoService.getVideoByCid('QmTestDatabaseCID123456789');
        console.log('✅ Video by CID:', videoByCid?.title);

        console.log('🎉 Database tests completed successfully!');

    } catch (error) {
        console.error('❌ Database test failed:', error);
    }
}

// Run the test
testDatabaseOperations();