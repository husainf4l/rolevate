const axios = require('axios');

const API_BASE = 'http://localhost:4005/api';

async function testSimplifiedMetadata() {
  try {
    console.log('🧪 Testing Simplified Metadata...\n');

    // Use the same parameters from your original URL
    const createData = {
      jobId: 'cmcxmffqf000diuc17tbhwwiy',
      phone: '962796026659'
    };
    
    console.log(`📡 Creating room with simplified metadata:`, createData);
    console.log('🔄 This should now have ONLY essential data...\n');
    
    const response = await axios.post(`${API_BASE}/room/create-new-room`, createData);

    console.log('✅ Simplified Create Room Response:');
    console.log('=====================================');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Extract room name from response
    const roomName = response.data.room?.name;
    
    if (roomName) {
      console.log('\n🔍 Checking Simplified LiveKit Metadata...');
      console.log('=====================================');
      
      // Check the room status on LiveKit server
      const statusResponse = await axios.get(`${API_BASE}/room/livekit-status?roomName=${roomName}`);
      
      if (statusResponse.data.room?.metadata) {
        console.log('✅ SUCCESS: Room has metadata on LiveKit server!');
        
        try {
          const metadata = JSON.parse(statusResponse.data.room.metadata);
          console.log('\n📋 Simplified Metadata:');
          console.log('=====================================');
          console.log('- Candidate Name:', metadata.candidateName);
          console.log('- Job Name:', metadata.jobName);
          console.log('- Company Name:', metadata.companyName);
          console.log('- Interview Prompt:', metadata.interviewPrompt ? 'Present' : 'Missing');
          
          console.log('\n📏 Metadata Size:', statusResponse.data.room.metadata.length, 'characters');
          console.log('🎯 Much smaller and focused for agent!');
          
        } catch (e) {
          console.log('- Raw metadata:', statusResponse.data.room.metadata);
        }
      } else {
        console.log('\n❌ ISSUE: Room created but no metadata on LiveKit server');
      }
    }
    
    console.log('\n✅ Simplified Metadata Test: COMPLETED');
    
  } catch (error) {
    console.error('❌ Simplified Metadata Test Failed:');
    console.error('Error Details:', error.response?.data || error.message);
  }
}

// Run the test
testSimplifiedMetadata();
