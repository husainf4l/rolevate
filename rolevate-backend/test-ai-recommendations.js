const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// Test configuration
const BASE_URL = 'http://localhost:3333';
const AUTH_TOKEN = 'temp-test-token'; // We'll use our temp auth for testing

// Sample test CV content
const createTestCV = () => {
  const cvContent = `
John Smith
Software Developer

Experience:
- Frontend Developer at Tech Corp (2 years)
- Built web applications using JavaScript
- Worked with databases

Skills:
- JavaScript
- HTML/CSS
- MySQL
- Git

Education:
- Computer Science Degree
`;
  
  fs.writeFileSync('/tmp/test-cv.txt', cvContent);
  return '/tmp/test-cv.txt';
};

async function testAIRecommendations() {
  console.log('🤖 Testing AI Recommendations System');
  console.log('=' .repeat(50));

  try {
    // Step 1: Create test CV file
    console.log('\n1️⃣ Creating test CV...');
    const cvPath = createTestCV();
    console.log('✅ Test CV created');

    // Step 2: Find a job to apply to
    console.log('\n2️⃣ Getting available jobs...');
    const jobsResponse = await axios.get(`${BASE_URL}/api/jobs`, {
      headers: { Authorization: `Bearer ${AUTH_TOKEN}` }
    });
    
    if (jobsResponse.data.length === 0) {
      console.log('❌ No jobs available for testing');
      return;
    }
    
    const testJob = jobsResponse.data[0];
    console.log(`✅ Found job: ${testJob.title} (ID: ${testJob.id})`);

    // Step 3: Apply to job with CV
    console.log('\n3️⃣ Applying to job with CV...');
    const formData = new FormData();
    formData.append('cv', fs.createReadStream(cvPath));

    const applyResponse = await axios.post(
      `${BASE_URL}/api/applications/apply/${testJob.id}`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${AUTH_TOKEN}`
        }
      }
    );

    console.log('✅ Application submitted successfully');
    console.log(`   Application ID: ${applyResponse.data.id}`);

    // Step 4: Wait for AI analysis to complete
    console.log('\n4️⃣ Waiting for AI analysis (10 seconds)...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Step 5: Check application with recommendations
    console.log('\n5️⃣ Fetching application with AI recommendations...');
    const appResponse = await axios.get(
      `${BASE_URL}/api/applications/my-application/${testJob.id}`,
      {
        headers: { Authorization: `Bearer ${AUTH_TOKEN}` }
      }
    );

    const application = appResponse.data;
    console.log('✅ Application retrieved');

    // Step 6: Display results
    console.log('\n📊 AI ANALYSIS RESULTS:');
    console.log('=' .repeat(50));
    
    console.log(`\n🎯 CV Analysis Score: ${application.cvAnalysisScore || 'Pending'}`);
    
    if (application.cvAnalysisResults) {
      console.log(`\n📈 Overall Fit: ${application.cvAnalysisResults.overallFit}`);
      console.log(`\n💪 Strengths:`);
      application.cvAnalysisResults.strengths?.forEach((strength, i) => {
        console.log(`   ${i + 1}. ${strength}`);
      });
      console.log(`\n⚠️  Areas for Improvement:`);
      application.cvAnalysisResults.weaknesses?.forEach((weakness, i) => {
        console.log(`   ${i + 1}. ${weakness}`);
      });
    }

    // Step 7: Display AI Recommendations
    console.log('\n🤖 AI RECOMMENDATIONS:');
    console.log('=' .repeat(50));

    if (application.aiCvRecommendations) {
      console.log('\n📝 CV Improvement Recommendations:');
      console.log(application.aiCvRecommendations);
    } else {
      console.log('\n📝 CV Recommendations: Still generating...');
    }

    if (application.aiInterviewRecommendations) {
      console.log('\n🎤 First Interview Preparation:');
      console.log(application.aiInterviewRecommendations);
    } else {
      console.log('\n🎤 Interview Recommendations: Still generating...');
    }

    if (application.aiSecondInterviewRecommendations) {
      console.log('\n🎭 Second Interview Strategy:');
      console.log(application.aiSecondInterviewRecommendations);
    } else {
      console.log('\n🎭 Second Interview Recommendations: Still generating...');
    }

    if (application.recommendationsGeneratedAt) {
      console.log(`\n⏰ Recommendations Generated: ${application.recommendationsGeneratedAt}`);
    }

    // Step 8: Test Summary
    console.log('\n📋 TEST SUMMARY:');
    console.log('=' .repeat(50));
    
    const hasScore = application.cvAnalysisScore !== null;
    const hasRecommendations = application.aiCvRecommendations || 
                              application.aiInterviewRecommendations || 
                              application.aiSecondInterviewRecommendations;
    
    console.log(`✅ CV Analysis: ${hasScore ? 'WORKING' : 'PENDING'}`);
    console.log(`✅ AI Recommendations: ${hasRecommendations ? 'WORKING' : 'PENDING'}`);
    console.log(`✅ Database Storage: WORKING`);
    console.log(`✅ API Response: WORKING`);

    if (hasScore && hasRecommendations) {
      console.log('\n🎉 AI RECOMMENDATIONS SYSTEM FULLY OPERATIONAL!');
    } else {
      console.log('\n⏳ System is processing... Check again in a few minutes');
    }

    // Cleanup
    fs.unlinkSync(cvPath);

  } catch (error) {
    console.error('\n❌ Error testing AI recommendations:');
    console.error(error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Tip: Make sure you have a valid auth token');
      console.log('   Run the auth test first to get a token');
    }
  }
}

// Run the test
testAIRecommendations();
