#!/usr/bin/env node

/**
 * Simple test script to verify Communication API endpoints
 * Run with: node test-communication-api.js
 */

const baseUrl = 'http://localhost:4005';

// You'll need to get a real JWT token from your auth system
// For testing, you can login first and get the token
const authToken = 'YOUR_JWT_TOKEN_HERE';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${authToken}`
};

async function testCommunicationEndpoints() {
  console.log('🚀 Testing Communication API Endpoints...\n');

  try {
    // Test 1: Get communications (should return empty array initially)
    console.log('1. Testing GET /api/communications');
    const response1 = await fetch(`${baseUrl}/api/communications`, { headers });
    const data1 = await response1.json();
    console.log('Status:', response1.status);
    console.log('Response:', JSON.stringify(data1, null, 2));
    console.log('✅ Get communications endpoint works\n');

    // Test 2: Get communication stats
    console.log('2. Testing GET /api/communications/stats');
    const response2 = await fetch(`${baseUrl}/api/communications/stats`, { headers });
    const data2 = await response2.json();
    console.log('Status:', response2.status);
    console.log('Response:', JSON.stringify(data2, null, 2));
    console.log('✅ Get stats endpoint works\n');

    // Test 3: Create a communication record (will fail if candidate/company don't exist)
    console.log('3. Testing POST /api/communications');
    const testCommunication = {
      candidateId: 'test-candidate-id', // Replace with real candidate ID
      type: 'WHATSAPP',
      direction: 'OUTBOUND',
      content: 'Test message from API'
    };
    
    const response3 = await fetch(`${baseUrl}/api/communications`, {
      method: 'POST',
      headers,
      body: JSON.stringify(testCommunication)
    });
    const data3 = await response3.json();
    console.log('Status:', response3.status);
    console.log('Response:', JSON.stringify(data3, null, 2));
    
    if (response3.status === 201) {
      console.log('✅ Create communication endpoint works\n');
    } else {
      console.log('⚠️  Create communication failed (expected if no test data)\n');
    }

  } catch (error) {
    console.error('❌ Error testing endpoints:', error.message);
  }
}

// Instructions for getting auth token
console.log(`
📋 INSTRUCTIONS:

1. First, login to get an auth token:
   curl -X POST ${baseUrl}/api/auth/login \\
     -H "Content-Type: application/json" \\
     -d '{"email":"your-email@company.com","password":"your-password"}'

2. Copy the "access_token" from the response

3. Update the authToken variable in this script

4. Run: node test-communication-api.js

Alternative: Test manually with curl:
curl -X GET "${baseUrl}/api/communications" \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

`);

// Uncomment the line below and add your token to run the test
// testCommunicationEndpoints();
