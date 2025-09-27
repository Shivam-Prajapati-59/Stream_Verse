// Test script for API endpoints
// Run this after starting the API server with: npm run server

const API_BASE = 'http://localhost:3001/api';

async function testAPI() {
    console.log('🧪 Testing Video API Endpoints...\n');

    try {
        // Test 1: Health check
        console.log('1️⃣  Testing health check...');
        const healthResponse = await fetch('http://localhost:3001/health');
        const healthData = await healthResponse.json();
        console.log('✅ Health check:', healthData);

        // Test 2: Get all videos (should be empty initially)
        console.log('\n2️⃣  Getting all videos...');
        const getAllResponse = await fetch(`${API_BASE}/videos`);
        const getAllData = await getAllResponse.json();
        console.log('✅ All videos:', getAllData);

        // Test 3: Create a new video
        console.log('\n3️⃣  Creating a new video...');
        const newVideo = {
            publicAddress: '0x742D35CC6635C0532925a3B8D05E51E4F7C4CE77',
            title: 'API Test Video',
            description: 'This video was created via API',
            cid: 'QmAPITestCID123456789',
            tags: ['api', 'test', 'blockchain']
        };

        const createResponse = await fetch(`${API_BASE}/videos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newVideo)
        });
        const createData = await createResponse.json();
        console.log('✅ Created video:', createData);

        const videoId = createData.data?.id;

        if (videoId) {
            // Test 4: Get video by ID
            console.log('\n4️⃣  Getting video by ID...');
            const getByIdResponse = await fetch(`${API_BASE}/videos/${videoId}`);
            const getByIdData = await getByIdResponse.json();
            console.log('✅ Video by ID:', getByIdData);

            // Test 5: Get videos by address
            console.log('\n5️⃣  Getting videos by address...');
            const getByAddressResponse = await fetch(`${API_BASE}/videos/address/0x742D35CC6635C0532925a3B8D05E51E4F7C4CE77`);
            const getByAddressData = await getByAddressResponse.json();
            console.log('✅ Videos by address:', getByAddressData);

            // Test 6: Get video by CID
            console.log('\n6️⃣  Getting video by CID...');
            const getByCidResponse = await fetch(`${API_BASE}/videos/cid/QmAPITestCID123456789`);
            const getByCidData = await getByCidResponse.json();
            console.log('✅ Video by CID:', getByCidData);

            // Test 7: Update video
            console.log('\n7️⃣  Updating video...');
            const updateData = {
                title: 'Updated API Test Video',
                tags: ['api', 'test', 'blockchain', 'updated']
            };

            const updateResponse = await fetch(`${API_BASE}/videos/${videoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData)
            });
            const updateResponseData = await updateResponse.json();
            console.log('✅ Updated video:', updateResponseData);

            // Test 8: Get all videos again (should show the updated video)
            console.log('\n8️⃣  Getting all videos again...');
            const getAllAgainResponse = await fetch(`${API_BASE}/videos`);
            const getAllAgainData = await getAllAgainResponse.json();
            console.log('✅ All videos after update:', getAllAgainData);
        }

        // Test 9: Error handling - Invalid address format
        console.log('\n9️⃣  Testing error handling (invalid address)...');
        const invalidVideo = {
            publicAddress: 'invalid-address',
            title: 'Test Video',
            cid: 'QmTestCID'
        };

        const errorResponse = await fetch(`${API_BASE}/videos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(invalidVideo)
        });
        const errorData = await errorResponse.json();
        console.log('✅ Error handling test:', errorData);

        console.log('\n🎉 All API tests completed!');

    } catch (error) {
        console.error('❌ API test failed:', error.message);
        console.error('Make sure the API server is running with: npm run server');
    }
}

// Run tests
testAPI();