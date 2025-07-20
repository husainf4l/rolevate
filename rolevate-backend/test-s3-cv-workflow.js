// Test S3 CV upload and analysis workflow
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testS3CVWorkflow() {
  console.log('🧪 Testing S3 CV upload and analysis workflow...');
  
  // Find a test CV file
  const testCVPath = '/Users/al-husseinabdullah/Desktop/rolevate/rolevate-backend/uploads/cvs/cmcvvinsb0000iul6uunqgsd0/cv_89d96f20-a3d8-44ad-bfe0-ab58cf830363.pdf';
  
  if (!fs.existsSync(testCVPath)) {
    console.log('❌ Test CV file not found');
    return;
  }
  
  try {
    console.log('📄 Using test CV:', testCVPath);
    
    // 1. Test S3 upload endpoint
    console.log('\n1️⃣ Testing S3 CV upload...');
    
    const formData = new FormData();
    formData.append('cv', fs.createReadStream(testCVPath));
    
    const uploadResponse = await axios.post('http://localhost:4005/api/uploads/cvs/s3', formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });
    
    console.log('✅ S3 Upload successful:', uploadResponse.data);
    const s3CvUrl = uploadResponse.data.cvUrl;
    
    // 2. Test CV text extraction from S3
    console.log('\n2️⃣ Testing CV text extraction from S3...');
    const { extractTextFromCV } = require('./src/utils/cv-text-extractor');
    
    const extractedText = await extractTextFromCV(s3CvUrl);
    console.log('✅ Text extraction from S3 successful!');
    console.log('📊 Text length:', extractedText.length);
    console.log('📄 Text preview (first 200 chars):');
    console.log(extractedText.substring(0, 200) + '...');
    
    // 3. Test anonymous application with S3 CV
    console.log('\n3️⃣ Testing anonymous application with S3 CV...');
    
    const applicationData = {
      jobId: 'cmcvdvxrv0000l3xnhqgo2qhk', // Use an existing job ID
      firstName: 'Test',
      lastName: 'Candidate',
      email: 'testcandidate@example.com',
      phone: '+1234567890',
      resumeUrl: s3CvUrl,
      coverLetter: 'I am interested in this position and my CV is now stored in S3.',
      expectedSalary: 75000,
      noticePeriod: '2 weeks'
    };
    
    const applicationResponse = await axios.post('http://localhost:4005/api/applications/anonymous', applicationData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('✅ Anonymous application with S3 CV successful!');
    console.log('📋 Application ID:', applicationResponse.data.id);
    
    console.log('\n🎉 S3 CV workflow test completed successfully!');
    console.log('✅ CV uploaded to S3');
    console.log('✅ CV text extracted from S3');
    console.log('✅ Application created with S3 CV');
    console.log('⏳ AI analysis will run in background...');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testS3CVWorkflow();
