const API_BASE = 'http://localhost:4005/api';

async function testWithRealRoom() {
  console.log('🧪 Testing LiveKit Server Status with Database Room...\n');

  // Test with a room that exists in database
  const roomName = 'interview_cmd9hrag1001c3ssw6k20uuh1_1752883802865';
  
  try {
    console.log(`📡 Testing server status for database room: ${roomName}`);
    
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
      
      if (result.databaseStatus.exists) {
        console.log(`📋 Database Room ID: ${result.databaseStatus.roomId}`);
        console.log(`👤 Created By: ${result.databaseStatus.createdBy || 'System'}`);
        console.log(`📅 Created At: ${new Date(result.databaseStatus.createdAt).toLocaleString()}`);
      }
      
      if (result.serverStatus.exists && result.serverStatus.room) {
        console.log(`👥 Active Participants: ${result.serverStatus.room.numParticipants}`);
        console.log(`📊 Publishers: ${result.serverStatus.room.numPublishers}`);
        console.log(`🎥 Recording: ${result.serverStatus.room.activeRecording}`);
      } else {
        console.log('ℹ️  Room exists in database but not active on LiveKit server');
        console.log('   This is normal - rooms are created on LiveKit server when participants join');
      }
      
      if (result.serverStatus.participants && result.serverStatus.participants.length > 0) {
        console.log('\n👥 Current Participants:');
        result.serverStatus.participants.forEach((p, i) => {
          console.log(`  ${i + 1}. ${p.identity} (${p.state}) - Joined: ${new Date(Number(p.joinedAt) * 1000).toLocaleString()}`);
        });
      } else {
        console.log('\n👥 No active participants currently in the room');
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testWithRealRoom();
