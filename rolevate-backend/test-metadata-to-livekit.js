const axios = require('axios');

const API_BASE = 'http://localhost:3000';

async function testMetadataToLiveKit() {
  try {
    console.log('🧪 Testing Metadata Transfer to LiveKit Server...\n');

    // Test with a room name that should exist
    const roomName = 'room_be5befc6-aafd-462c-a58c-b6ab8b6ebdae';
    
    console.log(`📡 Creating new room from: ${roomName}`);
    console.log('🔄 This should create room on LiveKit server WITH metadata...\n');
    
    const response = await axios.post(`${API_BASE}/room/create-new-room`, {
      roomName: roomName
    });

    console.log('✅ Room Creation Response:');
    console.log('=====================================');
    const data = response.data;
    const newRoomName = data.newRoom?.name;
    
    if (newRoomName) {
      console.log(`🆔 New Room Name: ${newRoomName}`);
      console.log(`🎫 Token Generated: ${data.token ? 'YES' : 'NO'}`);
      console.log(`📋 Metadata Size: ${JSON.stringify(data.newRoom?.metadata || {}).length} characters`);
      
      // Now check if the room exists on LiveKit server with metadata
      console.log('\n🔍 Checking LiveKit Server Status...');
      
      const statusResponse = await axios.get(`${API_BASE}/room/status/${newRoomName}`);
      const roomStatus = statusResponse.data;
      
      console.log('=====================================');
      console.log(`🏠 Room Exists on LiveKit: ${roomStatus.exists ? 'YES' : 'NO'}`);
      
      if (roomStatus.exists && roomStatus.room) {
        console.log(`📊 Room Info:`);
        console.log(`   - SID: ${roomStatus.room.sid}`);
        console.log(`   - Participants: ${roomStatus.room.numParticipants}`);
        console.log(`   - Metadata Present: ${roomStatus.room.metadata ? 'YES' : 'NO'}`);
        
        if (roomStatus.room.metadata) {
          try {
            const metadata = JSON.parse(roomStatus.room.metadata);
            console.log(`   - Metadata Size: ${roomStatus.room.metadata.length} characters`);
            console.log(`   - Job Details: ${metadata.jobDetails ? 'Present' : 'Missing'}`);
            console.log(`   - Company Details: ${metadata.companyDetails ? 'Present' : 'Missing'}`);
            console.log(`   - Candidate Details: ${metadata.candidateDetails ? 'Present' : 'Missing'}`);
            console.log(`   - Application Details: ${metadata.applicationDetails ? 'Present' : 'Missing'}`);
            
            // Show sample of the metadata structure
            console.log('\n📋 Metadata Structure:');
            console.log('=====================================');
            console.log('Job:', metadata.jobDetails?.title || 'N/A');
            console.log('Company:', metadata.companyDetails?.name || 'N/A');
            console.log('Candidate:', `${metadata.candidateDetails?.firstName || ''} ${metadata.candidateDetails?.lastName || ''}`.trim() || 'N/A');
            console.log('Skills:', metadata.candidateDetails?.skills || 'N/A');
            
          } catch (parseError) {
            console.log(`   - Metadata Parse Error: ${parseError.message}`);
          }
        }
      }
      
      console.log('\n🎯 Agent Test Instructions:');
      console.log('=====================================');
      console.log('1. Your agent should now see metadata when connecting to:');
      console.log(`   Room: ${newRoomName}`);
      console.log('2. The metadata includes comprehensive interview context');
      console.log('3. Agent can access job requirements, company info, and candidate background');
      console.log('4. Use this token to join the room and verify metadata access:');
      console.log(`   Token: ${data.token}`);
      
    } else {
      console.log('❌ No new room created in response');
    }
    
  } catch (error) {
    console.error('❌ Metadata Test Failed:');
    console.error('Error Details:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      console.log('\n💡 Tip: The original room might not exist.');
      console.log('   Try using an existing room name from the list-rooms endpoint.');
    }
  }
}

// Run the test
testMetadataToLiveKit();
