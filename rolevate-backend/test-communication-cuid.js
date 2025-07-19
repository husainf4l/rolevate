const axios = require('axios');

const API_BASE = 'http://localhost:4005/api';

async function testCommunicationWithCuid() {
  try {
    console.log('Testing communication API with CUID...');
    
    // Test data with CUID format
    const communicationData = {
      candidateId: "cmczzbfyz0004iut4igd2mkv4",
      jobId: null,
      type: "WHATSAPP",
      direction: "OUTBOUND",
      content: "Hello, this is a test message from Rolevate!"
    };

    console.log('Sending request:', communicationData);

    const response = await axios.post(`${API_BASE}/communications`, communicationData, {
      headers: {
        'Content-Type': 'application/json',
        // You'll need to add authorization header if required
        // 'Authorization': 'Bearer YOUR_JWT_TOKEN'
      }
    });

    console.log('✅ Success! Communication created:');
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('❌ Error creating communication:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Also test with a valid CUID to verify the candidate exists
async function checkCandidateExists() {
  try {
    console.log('\nChecking if candidate exists...');
    
    // You might need to create an endpoint to check candidates or use existing one
    const candidateId = "cmczzbfyz0004iut4igd2mkv4";
    
    // This is a placeholder - you'll need to adjust based on your actual candidate endpoint
    // const response = await axios.get(`${API_BASE}/candidates/${candidateId}`);
    // console.log('Candidate found:', response.data);
    
    console.log('Note: Add candidate check endpoint if needed');
    
  } catch (error) {
    console.error('Error checking candidate:', error.message);
  }
}

// Run tests
async function runTests() {
  await checkCandidateExists();
  await testCommunicationWithCuid();
}

runTests();
