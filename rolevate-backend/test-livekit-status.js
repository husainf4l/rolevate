const fetch = require('node-fetch');

async function testLiveKitStatus() {
  const baseUrl = 'http://localhost:3000';
  
  // Test with a sample room name
  const roomName = 'test-room-123';
  
  try {
    console.log('\n=== Testing LiveKit Server Status Endpoint ===');
    console.log(`Testing room: ${roomName}`);
    
    const response = await fetch(
      `${baseUrl}/api/room/livekit-status?roomName=${encodeURIComponent(roomName)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    
    console.log(`\nStatus: ${response.status}`);
    console.log(`Status Text: ${response.statusText}`);
    
    const result = await response.json();
    console.log('\nResponse:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.exists) {
      console.log('\n✅ Room exists on LiveKit server');
      console.log(`Participants: ${result.room.numParticipants}`);
      console.log(`Publishers: ${result.room.numPublishers}`);
      console.log(`Active Recording: ${result.room.activeRecording}`);
      
      if (result.participants && result.participants.length > 0) {
        console.log('\n👥 Current Participants:');
        result.participants.forEach((p, index) => {
          console.log(`  ${index + 1}. ${p.name || p.identity} (${p.state})`);
          if (p.tracks && p.tracks.length > 0) {
            console.log(`     Tracks: ${p.tracks.length}`);
          }
        });
      }
    } else {
      console.log('\n❌ Room does not exist on LiveKit server');
      if (result.error) {
        console.log(`Error: ${result.error}`);
      }
    }
    
    // Test with missing room name
    console.log('\n=== Testing Missing Room Name ===');
    const responseNoRoom = await fetch(`${baseUrl}/api/room/livekit-status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const resultNoRoom = await responseNoRoom.json();
    console.log('\nResponse (no room name):');
    console.log(JSON.stringify(resultNoRoom, null, 2));
    
  } catch (error) {
    console.error('\n❌ Error testing LiveKit status:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the server is running on localhost:3000');
      console.log('Run: npm run start:dev');
    }
  }
}

// Run the test
testLiveKitStatus();
