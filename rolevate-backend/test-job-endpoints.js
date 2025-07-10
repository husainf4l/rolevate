#!/usr/bin/env node

const BASE_URL = 'http://localhost:4005/api';

// Test data for job creation
const testJobData = {
  "title": "Sales Representative",
  "department": "Sales",
  "location": "Amman, Jordan",
  "salary": "JOD 10,000 - 15,000",
  "type": "FULL_TIME",
  "deadline": "2025-08-09",
  "description": "The Sales position in the healthcare industry in Amman, Jordan, involves engaging with healthcare providers and institutions to promote and sell medical products or services.",
  "responsibilities": "Key Responsibilities:\n\n• Develop and maintain relationships with healthcare providers and institutions to promote and sell products or services.\n• Identify new business opportunities and generate leads through market research and networking.",
  "requirements": "• Bachelor's degree in Business Administration, Marketing, or a related field\n• Proven experience in sales, preferably in the healthcare industry\n• Strong understanding of the healthcare market in Jordan",
  "benefits": "• Health insurance\n• Performance bonuses\n• Professional development opportunities\n• Paid time off\n• Employee discounts",
  "skills": ["Sales and negotiation skills", "Customer relationship management", "Market research and analysis"],
  "experience": "3-5 years",
  "education": "Bachelor's Degree",
  "jobLevel": "MID",
  "workType": "ONSITE",
  "industry": "healthcare",
  "companyDescription": "Based in Amman, JO, our healthcare company is a beacon of excellence in the industry.",
  "aiCvAnalysisPrompt": "Analyze the candidate CVs for the Sales position in the healthcare industry in Amman, Jordan.",
  "aiFirstInterviewPrompt": "Conduct an initial screening interview for the Sales position in the healthcare industry.",
  "aiSecondInterviewPrompt": "Conduct an in-depth final interview for the Sales position in the healthcare industry."
};

async function testEndpoints() {
  console.log('🚀 Testing Job Endpoints...\n');

  // Test 1: Get all public jobs (no auth required)
  console.log('1. Testing GET /jobs/public/all (no auth)...');
  try {
    const response = await fetch(`${BASE_URL}/jobs/public/all`);
    const data = await response.json();
    console.log('✅ Success:', response.status, '-', data.length || 0, 'jobs found');
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  // Test 2: Get all company jobs (requires auth)
  console.log('\n2. Testing GET /jobs/company/all (requires auth)...');
  try {
    const response = await fetch(`${BASE_URL}/jobs/company/all`, {
      headers: {
        'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE'
      }
    });
    const data = await response.json();
    console.log('Status:', response.status);
    if (response.status === 401) {
      console.log('⚠️  Expected: Unauthorized (need valid JWT token)');
    } else {
      console.log('✅ Success:', data.length || 0, 'jobs found');
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  // Test 3: Create a job (requires auth)
  console.log('\n3. Testing POST /jobs/create (requires auth)...');
  try {
    const response = await fetch(`${BASE_URL}/jobs/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE'
      },
      body: JSON.stringify(testJobData)
    });
    const data = await response.json();
    console.log('Status:', response.status);
    if (response.status === 401) {
      console.log('⚠️  Expected: Unauthorized (need valid JWT token)');
    } else {
      console.log('✅ Success: Job created with ID:', data.id);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  console.log('\n📝 Available endpoints:');
  console.log('• GET /jobs/public/all - Get all public jobs (no auth)');
  console.log('• GET /jobs/public/:id - Get specific public job (no auth)');
  console.log('• GET /jobs/company/all - Get all company jobs (auth required)');
  console.log('• POST /jobs/create - Create a new job (auth required)');
  console.log('• GET /jobs/:id - Get specific job (auth required)');
  console.log('• PATCH /jobs/:id - Update job (auth required)');
  console.log('• DELETE /jobs/:id - Delete job (auth required)');
  console.log('• PATCH /jobs/:id/status - Update job status (auth required)');
}

testEndpoints();
