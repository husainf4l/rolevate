const API_BASE = 'http://localhost:4005/api';

async function testLiveKitConnection() {
  console.log('🧪 Testing LiveKit Connection with Agent...\n');

  const roomName = 'test-connection-room-1752886080';
  
  try {
    // Step 1: Try to join the room (this will create it on LiveKit server)
    console.log('📡 Step 1: Attempting to join room to trigger creation...');
    
    const joinResponse = await fetch(`${API_BASE}/room/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: '+962796026659', // Use existing test phone
        jobId: 'cmcxmffqf000diuc17tbhwwiy', // Use existing test job
        roomName: roomName
      })
    });

    const joinResult = await joinResponse.json();
    console.log('Join Response:', joinResponse.status);
    
    if (joinResponse.ok) {
      console.log('✅ Successfully joined room!');
      console.log(`🎫 Token generated: ${!!joinResult.token}`);
      console.log(`👤 Participant: ${joinResult.participantName}`);
      console.log(`🔗 LiveKit URL: ${joinResult.liveKitUrl}`);
      
      // Step 2: Check server status after joining
      console.log('\n📊 Step 2: Checking server status after join...');
      
      // Wait a moment for the room to be created on server
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const statusResponse = await fetch(`${API_BASE}/room/server-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomName: roomName })
      });

      const statusResult = await statusResponse.json();
      
      console.log(`Server Room Exists: ${statusResult.serverStatus.exists} ${statusResult.serverStatus.exists ? '✅' : '❌'}`);
      console.log(`Database Room Exists: ${statusResult.databaseStatus.exists} ${statusResult.databaseStatus.exists ? '✅' : '❌'}`);
      console.log(`Status Match: ${statusResult.comparison.statusMatch} ${statusResult.comparison.statusMatch ? '✅' : '❌'}`);
      
      if (statusResult.serverStatus.exists && statusResult.serverStatus.room) {
        console.log(`\n🎉 Room is now active on LiveKit server!`);
        console.log(`📊 Participants: ${statusResult.serverStatus.room.numParticipants}`);
        console.log(`📡 Room SID: ${statusResult.serverStatus.room.sid}`);
        console.log(`⏱️  Creation Time: ${new Date(statusResult.serverStatus.room.creationTime * 1000).toLocaleString()}`);
        
        if (statusResult.serverStatus.participants.length > 0) {
          console.log('\n👥 Active Participants:');
          statusResult.serverStatus.participants.forEach((p, i) => {
            console.log(`  ${i + 1}. ${p.identity} (State: ${p.state}) - Joined: ${new Date(p.joinedAt * 1000).toLocaleString()}`);
          });
        }
        
        console.log('\n🤖 Your agent should now see this room and participant!');
        console.log('Check your agent logs for activity...');
      }
      
    } else {
      console.log('❌ Failed to join room:', JSON.stringify(joinResult, null, 2));
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testLiveKitConnection();
