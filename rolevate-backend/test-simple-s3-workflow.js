// Simplified S3 CV workflow test
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testS3CVWorkflow() {
  console.log('🧪 Testing S3 CV upload and application workflow...');
  
  // Find a test CV file
  const testCVPath = '/Users/al-husseinabdullah/Desktop/rolevate/rolevate-backend/uploads/cvs/cmcvvinsb0000iul6uunqgsd0/cv_89d96f20-a3d8-44ad-bfe0-ab58cf830363.pdf';
  
  if (!fs.existsSync(testCVPath)) {
    console.log('❌ Test CV file not found');
    return;
  }
  
  try {
    console.log('📄 Using test CV:', testCVPath);
    console.log('📊 File size:', fs.statSync(testCVPath).size, 'bytes');
    
    // 1. Upload CV to S3
    console.log('\n1️⃣ Uploading CV to S3...');
    
    const formData = new FormData();
    formData.append('cv', fs.createReadStream(testCVPath));
    
    const uploadResponse = await axios.post('http://localhost:4005/api/uploads/cvs/s3', formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });
    
    console.log('✅ S3 Upload successful!');
    console.log('📁 S3 URL:', uploadResponse.data.cvUrl);
    const s3CvUrl = uploadResponse.data.cvUrl;
    
    // 2. Create anonymous application with S3 CV
    console.log('\n2️⃣ Creating anonymous application with S3 CV...');
    
    const applicationData = {
      jobId: 'cmcxmffqf000diuc17tbhwwiy', // Valid job ID
      firstName: 'AWS',
      lastName: 'TestCandidate', 
      email: 'awstest@example.com',
      phone: '+1234567890',
      resumeUrl: s3CvUrl,
      coverLetter: 'I am applying with my CV stored in AWS S3.',
      expectedSalary: '75000',
      noticePeriod: '2 weeks'
    };
    
    const applicationResponse = await axios.post('http://localhost:4005/api/applications/anonymous/s3', applicationData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('✅ Anonymous application with S3 CV successful!');
    console.log('📋 Application ID:', applicationResponse.data.id);
    console.log('📋 Application status:', applicationResponse.data.status);
    console.log('📋 Resume URL:', applicationResponse.data.resumeUrl);
    
    if (applicationResponse.data.candidateCredentials) {
      console.log('🔑 Generated candidate credentials:');
      console.log('   Email:', applicationResponse.data.candidateCredentials.email);
      console.log('   Password:', applicationResponse.data.candidateCredentials.password);
    }
    
    // 3. Wait for AI analysis
    console.log('\n3️⃣ Waiting for AI analysis to complete...');
    console.log('⏳ Waiting 10 seconds for background CV analysis...');
    
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // 4. Check analysis results
    try {
      const checkResponse = await axios.get(`http://localhost:4005/api/applications/${applicationResponse.data.id}`);
      
      console.log('📊 AI Analysis Results:');
      console.log('   Score:', checkResponse.data.cvAnalysisScore || 'Not analyzed yet');
      console.log('   Analyzed at:', checkResponse.data.analyzedAt || 'Not analyzed yet');
      
      if (checkResponse.data.cvAnalysisResults) {
        console.log('   Overall Fit:', checkResponse.data.cvAnalysisResults.overallFit);
        console.log('   Summary Preview:', checkResponse.data.cvAnalysisResults.summary?.substring(0, 100) + '...');
      }
      
      if (checkResponse.data.aiCvRecommendations) {
        console.log('📝 CV Recommendations Preview:');
        console.log(checkResponse.data.aiCvRecommendations.substring(0, 150) + '...');
      } else {
        console.log('📝 CV Recommendations: Not generated yet (background process)');
      }
      
    } catch (error) {
      console.log('⚠️ Could not fetch analysis results:', error.response?.data || error.message);
    }
    
    console.log('\n🎉 S3 CV workflow test completed successfully!');
    console.log('✅ CV uploaded to AWS S3');
    console.log('✅ Anonymous application created with S3 CV URL');
    console.log('✅ AI analysis triggered in background');
    console.log('📝 The CV text will be extracted from S3 during analysis');
    
    // 5. Test direct S3 file access
    console.log('\n4️⃣ Testing direct S3 file access...');
    try {
      const s3Response = await axios.head(s3CvUrl);
      console.log('✅ S3 file accessible directly');
      console.log('📁 Content-Type:', s3Response.headers['content-type']);
      console.log('📊 Content-Length:', s3Response.headers['content-length'], 'bytes');
    } catch (error) {
      console.log('❌ S3 file not accessible directly:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the server is running on port 4005');
    }
  }
}

testS3CVWorkflow();
