// Test script to verify room creation endpoints
// Run: node test-room-creation.js

const fetch = require('node-fetch');

async function testRoomCreation() {
  console.log('🧪 Testing Room Creation Endpoints...\n');

  try {
    // Test 1: Test the room service endpoint you mentioned
    console.log('1️⃣ Testing /api/room/create-new-room endpoint...');
    
    const response = await fetch('https://rolevate.com/api/room/create-new-room', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jobId: 'cmdgkhmon001dj6hi33y92v3i', // Replace with a real job ID
        phone: '+962796026659' // Replace with a real phone number
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Room created successfully');
      console.log('📊 Metadata includes:');
      if (data.room && data.room.metadata) {
        console.log(`  - candidateName: ${data.room.metadata.candidateName}`);
        console.log(`  - jobName: ${data.room.metadata.jobName}`);
        console.log(`  - companyName: ${data.room.metadata.companyName}`);
        console.log(`  - interviewLanguage: ${data.room.metadata.interviewLanguage || 'MISSING!'}`);
        console.log(`  - interviewPrompt: ${data.room.metadata.interviewPrompt ? 'Present' : 'Missing'}`);
      } else {
        console.log('❌ No metadata found in response');
      }
    } else {
      const error = await response.text();
      console.log('❌ Request failed:', response.status, error);
    }

  } catch (error) {
    console.error('❌ Error testing endpoints:', error.message);
  }
}

testRoomCreation();
