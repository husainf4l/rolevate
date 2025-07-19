const axios = require('axios');

const API_BASE = 'http://localhost:4005';

async function testEnhancedCreateRoom() {
  try {
    console.log('🧪 Testing Enhanced Create New Room Endpoint...\n');

    // Test with a room name that should exist
    const roomName = 'room_be5befc6-aafd-462c-a58c-b6ab8b6ebdae';
    
    console.log(`📡 Creating new room from existing room: ${roomName}`);
    console.log('🔄 This should include comprehensive job/company/candidate details...\n');
    
    const response = await axios.post(`${API_BASE}/room/create-new-room`, {
      roomName: roomName
    });

    console.log('✅ Enhanced Create Room Response:');
    console.log('=====================================');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Validate that we have all the enhanced data
    const data = response.data;
    
    console.log('\n📊 Enhanced Features Validation:');
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
        console.log(`     - Work Experience: ${data.interviewContext.candidate.workExperiences ? data.interviewContext.candidate.workExperiences.length : 0} entries`);
        console.log(`     - Education: ${data.interviewContext.candidate.educationHistory ? data.interviewContext.candidate.educationHistory.length : 0} entries`);
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
    
    console.log('\n🎯 Agent Instructions:');
    console.log('=====================================');
    if (data.instructions) {
      Object.keys(data.instructions).forEach(step => {
        console.log(`${step}: ${data.instructions[step]}`);
      });
    }
    
    console.log('\n✅ Enhanced Create Room Test: SUCCESS');
    console.log('🤖 AI agents now have comprehensive interview context!');
    
  } catch (error) {
    console.error('❌ Enhanced Create Room Test Failed:');
    console.error('Error Details:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      console.log('\n💡 Tip: The room might not exist. Try testing with an existing room name.');
      console.log('   You can use the list-rooms endpoint to find existing rooms.');
    }
  }
}

// Run the test
testEnhancedCreateRoom();
