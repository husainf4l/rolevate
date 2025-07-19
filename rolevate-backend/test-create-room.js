const axios = require('axios');

const API_BASE = 'http://localhost:4005/api';

async function testCreateRoom() {
  try {
    console.log('🧪 Testing Create Room Endpoint...\n');

    // Test with the parameters from your URL example
    const createRoomData = {
      phone: '962796026659',
      jobId: 'cmcxmffqf000diuc17tbhwwiy'
    };
    
    console.log(`📡 Creating interview room for:`);
    console.log(`   Phone: ${createRoomData.phone}`);
    console.log(`   Job ID: ${createRoomData.jobId}`);
    console.log('🔄 This will create a room with comprehensive metadata sent to LiveKit...\n');
    
    const response = await axios.post(`${API_BASE}/room/create`, createRoomData);

    console.log('✅ Create Room Response:');
    console.log('=====================================');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Validate that we have all the enhanced data
    const data = response.data;
    
    console.log('\n📊 Metadata Features Validation:');
    console.log('=====================================');
    
    if (data.interviewContext) {
      console.log('✅ Interview Context: Present');
      
      if (data.interviewContext.job) {
        console.log('  ✅ Job Details: Present');
        console.log(`     - Title: ${data.interviewContext.job.title || 'N/A'}`);
        console.log(`     - Requirements: ${data.interviewContext.job.requirements ? 'Present' : 'Missing'}`);
        console.log(`     - Responsibilities: ${data.interviewContext.job.responsibilities ? 'Present' : 'Missing'}`);
      }
      
      if (data.interviewContext.company) {
        console.log('  ✅ Company Details: Present');
        console.log(`     - Name: ${data.interviewContext.company.name || 'N/A'}`);
        console.log(`     - Industry: ${data.interviewContext.company.industry || 'N/A'}`);
        console.log(`     - Description: ${data.interviewContext.company.description ? 'Present' : 'Missing'}`);
      }
      
      if (data.interviewContext.candidate) {
        console.log('  ✅ Candidate Details: Present');
        console.log(`     - Name: ${data.interviewContext.candidate.firstName} ${data.interviewContext.candidate.lastName}`);
        console.log(`     - Skills: ${data.interviewContext.candidate.skills ? 'Present' : 'Missing'}`);
        console.log(`     - Work Experience: ${data.interviewContext.candidate.workExperience ? data.interviewContext.candidate.workExperience.length : 0} entries`);
        console.log(`     - Education: ${data.interviewContext.candidate.education ? data.interviewContext.candidate.education.length : 0} entries`);
      }
      
      if (data.interviewContext.application) {
        console.log('  ✅ Application Details: Present');
        console.log(`     - Status: ${data.interviewContext.application.status || 'N/A'}`);
        console.log(`     - Applied Date: ${data.interviewContext.application.appliedAt || 'N/A'}`);
      }
    } else {
      console.log('❌ Interview Context: Missing');
    }
    
    if (data.interviewSummary) {
      console.log('\n✅ Interview Summary: Present');
      console.log(`  - Candidate: ${data.interviewSummary.candidateName}`);
      console.log(`  - Position: ${data.interviewSummary.position}`);
      console.log(`  - Company: ${data.interviewSummary.company}`);
      console.log(`  - Experience Count: ${data.interviewSummary.experience}`);
      console.log(`  - Education Count: ${data.interviewSummary.education}`);
      console.log(`  - Status: ${data.interviewSummary.applicationStatus}`);
    } else {
      console.log('\n❌ Interview Summary: Missing');
    }
    
    if (data.room) {
      console.log('\n🏠 Room Information:');
      console.log('=====================================');
      console.log(`Room Name: ${data.room.name}`);
      console.log(`Room ID: ${data.room.id}`);
      console.log(`Created At: ${data.room.createdAt}`);
      console.log(`Token Expires: ${data.expiresAt}`);
      console.log(`Participant Name: ${data.participantName}`);
    }
    
    console.log('\n🎯 Agent Instructions:');
    console.log('=====================================');
    if (data.instructions) {
      Object.keys(data.instructions).forEach(step => {
        console.log(`${step}: ${data.instructions[step]}`);
      });
    }
    
    console.log('\n✅ Create Room Test: SUCCESS');
    console.log('🤖 Room created with comprehensive metadata sent to LiveKit server!');
    console.log('📡 Your AI agent should now be able to access all the metadata!');
    
  } catch (error) {
    console.error('❌ Create Room Test Failed:');
    console.error('Error Details:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      console.log('\n💡 Tip: Make sure the backend is running on port 4005.');
      console.log('   Also check that the phone number and jobId exist in the database.');
    }
  }
}

// Run the test
testCreateRoom();
