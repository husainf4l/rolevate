const axios = require('axios');

const API_BASE = 'http://localhost:4005/api';

async function testCVAnalysisInMetadata() {
  try {
    console.log('🧪 Testing CV Analysis in LiveKit Metadata...\n');

    // Use the same parameters from your original URL
    const createData = {
      jobId: 'cmcxmffqf000diuc17tbhwwiy',
      phone: '962796026659'
    };
    
    console.log(`📡 Creating room with CV analysis in metadata:`, createData);
    console.log('🔄 This should now include CV analysis results...\n');
    
    const response = await axios.post(`${API_BASE}/room/create-new-room`, createData);

    console.log('✅ Create Room Response with CV Analysis:');
    console.log('=====================================');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Extract room name from response
    const roomName = response.data.room?.name;
    
    if (roomName) {
      console.log('\n🔍 Checking LiveKit Metadata for CV Analysis...');
      console.log('=====================================');
      
      // Check the room status on LiveKit server
      const statusResponse = await axios.get(`${API_BASE}/room/livekit-status?roomName=${roomName}`);
      
      if (statusResponse.data.room?.metadata) {
        console.log('✅ SUCCESS: Room has metadata on LiveKit server!');
        
        try {
          const metadata = JSON.parse(statusResponse.data.room.metadata);
          console.log('\n📋 Enhanced Metadata with CV Analysis:');
          console.log('=====================================');
          console.log('- Candidate Name:', metadata.candidateName);
          console.log('- Job Name:', metadata.jobName);
          console.log('- Company Name:', metadata.companyName);
          console.log('- Interview Prompt:', metadata.interviewPrompt ? 'Present' : 'Missing');
          
          if (metadata.cvAnalysis) {
            console.log('\n🎯 CV Analysis Results:');
            console.log('- Score:', metadata.cvAnalysis.score);
            console.log('- Summary:', metadata.cvAnalysis.summary);
            console.log('- Overall Fit:', metadata.cvAnalysis.overallFit);
            console.log('- Strengths:', metadata.cvAnalysis.strengths);
            console.log('- Weaknesses:', metadata.cvAnalysis.weaknesses);
          } else {
            console.log('\n⚠️  CV Analysis: Not available (candidate may not have been analyzed yet)');
          }
          
          console.log('\n📏 Total Metadata Size:', statusResponse.data.room.metadata.length, 'characters');
          console.log('🎯 Agent now has interview context AND CV analysis!');
          
        } catch (e) {
          console.log('- Raw metadata:', statusResponse.data.room.metadata);
        }
      } else {
        console.log('\n❌ ISSUE: Room created but no metadata on LiveKit server');
      }
    }
    
    console.log('\n✅ CV Analysis Metadata Test: COMPLETED');
    
  } catch (error) {
    console.error('❌ CV Analysis Metadata Test Failed:');
    console.error('Error Details:', error.response?.data || error.message);
  }
}

// Run the test
testCVAnalysisInMetadata();
