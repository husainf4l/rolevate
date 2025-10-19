/**
 * Test FastAPI CV Analysis Integration
 * 
 * This script tests the full CV analysis flow:
 * 1. Calls FastAPI with CV URL and job details
 * 2. FastAPI analyzes the CV
 * 3. FastAPI posts results back to NestJS GraphQL
 */

import axios from 'axios';

const FASTAPI_URL = process.env.CV_ANALYSIS_API_URL || 'http://localhost:8000';
const GRAPHQL_URL = process.env.GRAPHQL_API_URL || 'http://localhost:4005/api/graphql';
const SYSTEM_API_KEY = process.env.SYSTEM_API_KEY || '';

// Test data
const testData = {
  application_id: 'test-app-' + Date.now(),
  candidateid: 'test-candidate-' + Date.now(),
  jobid: 'test-job-123',
  cv_link: 'https://4wk-garage-media.s3.me-central-1.amazonaws.com/cvs/anonymous/1e604193-8a7d-454d-89af-6a7bf115cb60-AlHussein_Resume_21.pdf',
  callbackUrl: GRAPHQL_URL,
  systemApiKey: SYSTEM_API_KEY,
};

async function testFastAPIAnalysis() {
  console.log('🧪 Testing FastAPI CV Analysis Integration\n');
  console.log('📋 Test Configuration:');
  console.log('  FastAPI URL:', FASTAPI_URL);
  console.log('  GraphQL Callback URL:', GRAPHQL_URL);
  console.log('  System API Key:', SYSTEM_API_KEY ? '✅ Set' : '❌ Missing');
  console.log('\n📦 Payload:');
  console.log(JSON.stringify(testData, null, 2));

  try {
    console.log('\n🚀 Sending request to FastAPI...\n');
    
    const startTime = Date.now();
    
    const response = await axios.post(`${FASTAPI_URL}/cv-analysis`, testData, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 120000, // 2 minutes timeout for CV analysis
    });

    const duration = Date.now() - startTime;

    console.log('\n✅ FastAPI Response Received!');
    console.log('⏱️  Duration:', duration, 'ms');
    console.log('📊 Status:', response.status);
    console.log('\n📄 Response Data:');
    console.log(JSON.stringify(response.data, null, 2));

    // Check what data was returned
    if (response.data) {
      console.log('\n🔍 Analysis Results:');
      
      if (response.data.cvAnalysisScore !== undefined) {
        console.log('  CV Score:', response.data.cvAnalysisScore);
      }
      
      if (response.data.candidateInfo) {
        console.log('  ✅ Candidate Info Extracted:');
        console.log('    Name:', response.data.candidateInfo.name);
        console.log('    Email:', response.data.candidateInfo.email);
        console.log('    Phone:', response.data.candidateInfo.phone);
        console.log('    LinkedIn:', response.data.candidateInfo.linkedinUrl);
      }
      
      if (response.data.cvAnalysisResults) {
        console.log('  ✅ CV Analysis Results:');
        const results = typeof response.data.cvAnalysisResults === 'string' 
          ? JSON.parse(response.data.cvAnalysisResults)
          : response.data.cvAnalysisResults;
        console.log('    Skills Match:', results.skills_match || 'N/A');
        console.log('    Experience Match:', results.experience_match || 'N/A');
      }
      
      if (response.data.aiCvRecommendations) {
        console.log('  ✅ CV Recommendations Generated');
      }
      
      if (response.data.aiInterviewRecommendations) {
        console.log('  ✅ Interview Recommendations Generated');
      }
    }

  } catch (error: any) {
    console.error('\n❌ FastAPI Error:');
    
    if (error.response) {
      console.error('  Status:', error.response.status);
      console.error('  Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('  No response received from FastAPI');
      console.error('  Make sure FastAPI is running on:', FASTAPI_URL);
    } else {
      console.error('  Error:', error.message);
    }
    
    console.error('\n  Stack:', error.stack);
  }
}

// Run the test
console.log('🎯 FastAPI CV Analysis Test\n');
console.log('Make sure:');
console.log('  1. FastAPI server is running (python main.py or uvicorn)');
console.log('  2. NestJS server is running (for GraphQL callback)');
console.log('  3. Environment variables are set in .env');
console.log('\n' + '='.repeat(60) + '\n');

testFastAPIAnalysis().then(() => {
  console.log('\n' + '='.repeat(60));
  console.log('✅ Test completed');
}).catch((error) => {
  console.error('\n❌ Test failed:', error.message);
  process.exit(1);
});
