#!/usr/bin/env node

const API_BASE = 'http://localhost:4005/api';

async function createFreshRoomForAgent() {
  console.log('🤖 Creating Fresh Room to Trigger Agent Detection...\n');

  // Create a unique room name
  const timestamp = Date.now();
  const roomName = `agent-test-room-${timestamp}`;
  
  console.log(`📝 Creating room: ${roomName}`);

  try {
    // Step 1: Create room using LiveKit API
    console.log('📡 Step 1: Creating room via LiveKit API...');
    
    const createResponse = await fetch(`${API_BASE}/livekit/create-room`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: roomName,
        metadata: {
          type: "agent-test",
          purpose: "trigger-agent-detection",
          createdAt: new Date().toISOString()
        },
        userId: "agent-test-user",
        participantName: "Agent Test Participant"
      })
    });

    const createResult = await createResponse.json();
    
    if (createResponse.ok) {
      console.log('✅ Room created successfully!');
      console.log(`🎫 Token: ${createResult.token.substring(0, 20)}...`);
      console.log(`🔗 URL: ${createResult.url}`);
      
      // Step 2: Wait a moment and check server status
      console.log('\n⏳ Waiting 3 seconds for room to be active...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const statusResponse = await fetch(`${API_BASE}/room/server-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomName: roomName })
      });

      const statusResult = await statusResponse.json();
      
      console.log('\n📊 Room Status Check:');
      console.log(`Server Exists: ${statusResult.serverStatus.exists} ${statusResult.serverStatus.exists ? '✅' : '❌'}`);
      console.log(`Database Exists: ${statusResult.databaseStatus.exists} ${statusResult.databaseStatus.exists ? '✅' : '❌'}`);
      
      if (statusResult.serverStatus.exists) {
        console.log(`🎉 Room is active on LiveKit server!`);
        console.log(`📊 Participants: ${statusResult.serverStatus.room.numParticipants}`);
        console.log(`📡 Room SID: ${statusResult.serverStatus.room.sid}`);
      }
      
      // Step 3: Provide agent connection details
      console.log('\n🤖 For your agent to connect:');
      console.log(`Room Name: ${roomName}`);
      console.log(`LiveKit URL: ${createResult.url}`);
      console.log(`Room should appear in your agent logs if it\'s monitoring room events`);
      
      // Step 4: Instructions for manual testing
      console.log('\n🌐 To test manually with a web client:');
      console.log('1. Use the token generated above');
      console.log('2. Connect to the LiveKit URL');
      console.log('3. Join with participant name "Agent Test Participant"');
      console.log('4. Your agent should detect the participant joining');
      
      return {
        roomName,
        token: createResult.token,
        url: createResult.url
      };
      
    } else {
      console.log('❌ Failed to create room:', JSON.stringify(createResult, null, 2));
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
createFreshRoomForAgent().then(result => {
  if (result) {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 SUCCESS: Room created and ready for agent testing!');
    console.log('Check your agent terminal for new activity...');
    console.log('='.repeat(60));
  }
});
