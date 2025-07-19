const axios = require('axios');

const API_BASE = 'http://localhost:4005/api';

async function testCreateRoomWithMetadata() {
  try {
    console.log('🧪 Testing Create Room Endpoint with Metadata...\n');

    // Use the same parameters from your original URL
    const createData = {
      jobId: 'cmcxmffqf000diuc17tbhwwiy',
      phone: '962796026659'
    };
    
    console.log(`📡 Creating room with:`, createData);
    console.log('🔄 This should create a room with comprehensive metadata on LiveKit server...\n');
    
    const response = await axios.post(`${API_BASE}/room/create`, createData);

    console.log('✅ Create Room Response:');
    console.log('=====================================');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Extract room name from response
    const roomName = response.data.newRoom?.name || response.data.roomName;
    
    if (roomName) {
      console.log('\n🔍 Checking LiveKit Room Status for Metadata...');
      console.log('=====================================');
      
      // Check the room status on LiveKit server
      const statusResponse = await axios.get(`${API_BASE}/room/livekit-status?roomName=${roomName}`);
      
      console.log('LiveKit Room Status:');
      console.log(JSON.stringify(statusResponse.data, null, 2));
      
      // Check if metadata exists
      if (statusResponse.data.room?.metadata) {
        console.log('\n✅ SUCCESS: Room has metadata on LiveKit server!');
        console.log('🤖 Agent will now be able to access interview context');
        
        try {
          const metadata = JSON.parse(statusResponse.data.room.metadata);
          console.log('\n📋 Metadata Preview:');
          console.log('- Job Title:', metadata.jobDetails?.title || 'N/A');
          console.log('- Company:', metadata.companyDetails?.name || 'N/A');
          console.log('- Candidate:', metadata.candidateDetails?.firstName, metadata.candidateDetails?.lastName || 'N/A');
        } catch (e) {
          console.log('- Raw metadata:', statusResponse.data.room.metadata);
        }
      } else {
        console.log('\n❌ ISSUE: Room created but no metadata on LiveKit server');
        console.log('🔧 This means the agent still won\'t have interview context');
      }
    }
    
    console.log('\n✅ Create Room Test: COMPLETED');
    
  } catch (error) {
    console.error('❌ Create Room Test Failed:');
    console.error('Error Details:', error.response?.data || error.message);
    
    if (error.response?.status === 400) {
      console.log('\n💡 Tip: Check if the jobId and phone number exist in the database.');
    }
  }
}

// Run the test
testCreateRoomWithMetadata();
