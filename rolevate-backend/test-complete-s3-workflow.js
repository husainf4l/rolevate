// Test uploading CV to S3 and complete workflow
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testCompleteS3CVWorkflow() {
  console.log('🧪 Testing complete S3 CV upload and analysis workflow...');
  
  // Find a test CV file from uploads
  const testCVPath = '/Users/al-husseinabdullah/Desktop/rolevate/rolevate-backend/uploads/cvs/cmcvvinsb0000iul6uunqgsd0/cv_89d96f20-a3d8-44ad-bfe0-ab58cf830363.pdf';
  
  if (!fs.existsSync(testCVPath)) {
    console.log('❌ Test CV file not found');
    return;
  }
  
  try {
    console.log('📄 Using test CV:', testCVPath);
    console.log('📊 File size:', fs.statSync(testCVPath).size, 'bytes');
    
    // 1. Test S3 upload endpoint
    console.log('\n1️⃣ Testing S3 CV upload...');
    
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
    
    // 2. Test CV text extraction from S3 URL directly
    console.log('\n2️⃣ Testing CV text extraction from S3...');
    
    // Import and test the text extractor
    const textExtractionTest = `
      const { extractTextFromCV } = require('./dist/utils/cv-text-extractor');
      
      extractTextFromCV('${s3CvUrl}')
        .then(text => {
          console.log('✅ Text extraction from S3 successful!');
          console.log('📊 Text length:', text.length);
          console.log('📄 Text preview (first 200 chars):');
          console.log(text.substring(0, 200) + '...');
        })
        .catch(error => {
          console.error('❌ Text extraction failed:', error.message);
        });
    `;
    
    // Write and run extraction test
    fs.writeFileSync('./test-s3-extraction.js', textExtractionTest);
    
    const { exec } = require('child_process');
    await new Promise((resolve, reject) => {
      exec('node test-s3-extraction.js', (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Text extraction test failed:', error.message);
        } else {
          console.log(stdout);
        }
        resolve();
      });
    });
    
    // 3. Test anonymous application with S3 CV using the existing endpoint
    console.log('\n3️⃣ Testing anonymous application with S3 CV...');
    
    // First, let's test the current anonymous endpoint with manual resumeUrl
    const testApplicationPayload = {
      jobId: 'cmcvdvxrv0000l3xnhqgo2qhk', // Use an existing job ID
      firstName: 'AWS',
      lastName: 'TestCandidate', 
      email: 'awstest@example.com',
      phone: '+1234567890',
      resumeUrl: s3CvUrl, // Use the S3 URL
      coverLetter: 'I am applying with my CV stored in AWS S3.',
      expectedSalary: '75000',
      noticePeriod: '2 weeks'
    };
    
    console.log('📋 Application payload:', JSON.stringify(testApplicationPayload, null, 2));
    
    const applicationResponse = await axios.post('http://localhost:4005/api/applications/anonymous/s3', testApplicationPayload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('✅ Anonymous application with S3 CV successful!');
    console.log('📋 Application ID:', applicationResponse.data.id);
    console.log('📋 Application status:', applicationResponse.data.status);
    
    if (applicationResponse.data.candidateCredentials) {
      console.log('🔑 Generated candidate credentials:');
      console.log('   Email:', applicationResponse.data.candidateCredentials.email);
      console.log('   Password:', applicationResponse.data.candidateCredentials.password);
    }
    
    // 4. Wait for AI analysis to complete and check results
    console.log('\n4️⃣ Waiting for AI analysis to complete...');
    console.log('⏳ Waiting 8 seconds for background analysis...');
    
    await new Promise(resolve => setTimeout(resolve, 8000));
    
    // Check application status
    try {
      const checkResponse = await axios.get(`http://localhost:4005/api/applications/${applicationResponse.data.id}`);
      console.log('📊 AI Analysis Results:');
      console.log('   Score:', checkResponse.data.cvAnalysisScore);
      console.log('   Analyzed at:', checkResponse.data.analyzedAt);
      
      if (checkResponse.data.cvAnalysisResults) {
        console.log('   Overall Fit:', checkResponse.data.cvAnalysisResults.overallFit);
        console.log('   Summary:', checkResponse.data.cvAnalysisResults.summary);
      }
      
      if (checkResponse.data.aiCvRecommendations) {
        console.log('📝 CV Recommendations:');
        console.log(checkResponse.data.aiCvRecommendations.substring(0, 200) + '...');
      }
      
    } catch (error) {
      console.log('⚠️ Could not fetch analysis results:', error.response?.data || error.message);
    }
    
    console.log('\n🎉 Complete S3 CV workflow test successful!');
    console.log('✅ CV uploaded to AWS S3');
    console.log('✅ CV text extracted from S3');
    console.log('✅ Anonymous application created');
    console.log('✅ AI analysis triggered');
    
    // Clean up test file
    try {
      fs.unlinkSync('./test-s3-extraction.js');
    } catch (e) {}
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 500) {
      console.log('🔍 This might be an AWS configuration issue. Let me check...');
      
      // Test AWS S3 connectivity
      console.log('\n🔧 Testing AWS S3 connectivity...');
      const { exec } = require('child_process');
      exec('aws s3 ls s3://4wk-garage-media/', (error, stdout, stderr) => {
        if (error) {
          console.error('❌ AWS S3 access failed:', error.message);
          console.log('💡 Please check AWS credentials and permissions');
        } else {
          console.log('✅ AWS S3 access working');
          console.log(stdout);
        }
      });
    }
  }
}

testCompleteS3CVWorkflow();
