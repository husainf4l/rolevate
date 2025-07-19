const API_BASE = 'http://localhost:4005/api';

async function testLiveKitServerStatus() {
  console.log('🧪 Testing LiveKit Server Status Endpoint...\n');

  // Test with an existing room
  const roomName = 'interview-room-job-cm5gdxp3c0002s4b0lnfbq8w4-candidate-cm5ghfqzk0000114r6wbp1u2y';
  
  try {
    console.log(`📡 Testing server status for room: ${roomName}`);
    
    const response = await fetch(`${API_BASE}/room/server-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        roomName: roomName
      })
    });

    const result = await response.json();
    
    console.log('\n📊 Server Status Response:');
    console.log('Status Code:', response.status);
    console.log('Response:', JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('\n✅ Server Status Analysis:');
      console.log(`🖥️  Server Room Exists: ${result.serverStatus.exists}`);
      console.log(`💾 Database Room Exists: ${result.databaseStatus.exists}`);
      console.log(`🔄 Status Match: ${result.comparison.statusMatch}`);
      
      if (result.serverStatus.exists && result.serverStatus.room) {
        console.log(`👥 Active Participants: ${result.serverStatus.room.numParticipants}`);
        console.log(`📊 Publishers: ${result.serverStatus.room.numPublishers}`);
        console.log(`🎥 Recording: ${result.serverStatus.room.activeRecording}`);
      }
      
      if (result.serverStatus.participants && result.serverStatus.participants.length > 0) {
        console.log('\n👥 Current Participants:');
        result.serverStatus.participants.forEach((p, i) => {
          console.log(`  ${i + 1}. ${p.identity} (${p.state}) - Joined: ${new Date(Number(p.joinedAt) * 1000).toLocaleString()}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }

  console.log('\n' + '='.repeat(50));
  
  // Test with a non-existent room
  const fakeRoom = 'non-existent-room-123';
  
  try {
    console.log(`📡 Testing server status for non-existent room: ${fakeRoom}`);
    
    const response = await fetch(`${API_BASE}/room/server-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        roomName: fakeRoom
      })
    });

    const result = await response.json();
    
    console.log('\n📊 Non-existent Room Response:');
    console.log('Status Code:', response.status);
    console.log('Response:', JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testLiveKitServerStatus();
