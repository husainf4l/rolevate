/**
 * Test System API Key Authentication
 * This script tests that the system API key from .env works for FastAPI callbacks
 */

import axios from 'axios';

const GRAPHQL_URL = 'http://localhost:4005/api/graphql';
const SYSTEM_API_KEY = '31a29647809f2bf22295b854b30eafd58f50ea1559b0875ad2b55f508aa5215e';

const mutation = `
  mutation UpdateApplicationAnalysis($input: UpdateApplicationAnalysisInput!) {
    updateApplicationAnalysis(input: $input) {
      id
      cvAnalysisScore
      analyzedAt
      candidate {
        id
        email
        name
        candidateProfile {
          firstName
          lastName
          phone
        }
      }
    }
  }
`;

async function testSystemApiKey() {
  console.log('🧪 Testing System API Key authentication...');
  console.log('🔑 Using API Key:', SYSTEM_API_KEY);
  
  try {
    const response = await axios.post(
      GRAPHQL_URL,
      {
        query: mutation,
        variables: {
          input: {
            applicationId: 'test-app-id-123',
            cvAnalysisScore: 85,
            cvAnalysisResults: JSON.stringify({ test: 'data' }),
            aiCvRecommendations: 'Test recommendation',
            aiInterviewRecommendations: 'Test interview questions',
            candidateInfo: {
              firstName: 'Test',
              lastName: 'User',
              email: 'test@example.com',
              phone: '+1234567890'
            }
          }
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': SYSTEM_API_KEY
        }
      }
    );

    if (response.data.errors) {
      console.error('❌ GraphQL errors:', JSON.stringify(response.data.errors, null, 2));
      
      if (response.data.errors[0]?.message === 'Forbidden resource') {
        console.error('\n🔴 AUTHENTICATION FAILED: System API key not accepted');
        console.error('Check that:');
        console.error('1. NestJS server is running');
        console.error('2. SYSTEM_API_KEY in .env matches the key being sent');
        console.error('3. ApiKeyService.validateApiKey() checks environment variable first');
      }
      return;
    }

    console.log('✅ Authentication successful!');
    console.log('📊 Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error: any) {
    if (error.response) {
      console.error('❌ HTTP Error:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

testSystemApiKey();
