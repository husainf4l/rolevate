// Test script for LiveKit room creation and WhatsApp interview notifications
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

const API_BASE = 'http://localhost:4005/api';

async function testLiveKitIntegrationFlow() {
  console.log('🎬 Testing LiveKit Integration with Anonymous Application...');
  
  // Create a test CV file path - replace with your actual CV file
  const cvFilePath = './test-cv.pdf';
  
  if (!fs.existsSync(cvFilePath)) {
    console.log('⚠️ CV file not found at:', cvFilePath);
    console.log('Please create a test CV file or update the path');
    return;
  }

  try {
    const form = new FormData();
    
    // Add CV file
    form.append('cv', fs.createReadStream(cvFilePath));
    
    // Add application data with phone number for WhatsApp
    form.append('jobId', 'your_job_id_here'); // Replace with actual job ID
    form.append('firstName', 'John');
    form.append('lastName', 'Doe');
    form.append('email', 'john.doe.interview@example.com');
    form.append('phone', '+962799123456'); // Important: Phone number for WhatsApp
    form.append('portfolioUrl', 'https://johndoe.portfolio.com');
    form.append('coverLetter', 'I am very excited to apply for this position and ready for an interview!');
    form.append('expectedSalary', '5000 JOD');
    form.append('noticePeriod', '1 month');

    console.log('📤 Submitting application with LiveKit integration...');

    const response = await axios.post(`${API_BASE}/applications/anonymous`, form, {
      headers: {
        ...form.getHeaders()
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    console.log('✅ Application submitted successfully!');
    console.log('📋 Application Details:');
    console.log('- Application ID:', response.data.id);
    console.log('- Candidate ID:', response.data.candidateId);
    console.log('- Job ID:', response.data.jobId);
    console.log('- Status:', response.data.status);
    
    if (response.data.candidateCredentials) {
      console.log('\n🔑 New Account Created:');
      console.log('- Email:', response.data.candidateCredentials.email);
      console.log('- Password:', response.data.candidateCredentials.password);
    }
    
    console.log('\n🎥 Expected LiveKit Actions:');
    console.log('1. LiveKit room created with metadata:');
    console.log('   - candidatePhone: +962799123456');
    console.log('   - jobId: your_job_id_here');
    console.log('   - applicationId:', response.data.id);
    console.log('2. WhatsApp message sent to candidate with interview link');
    console.log('3. Communication record created in database');
    
    console.log('\n📱 Expected WhatsApp Message Content:');
    console.log('🎉 Congratulations! Your application for "[Job Title]" has been received.');
    console.log('');
    console.log('You\'re invited to a video interview:');
    console.log('🎥 Interview Room: interview_[applicationId]_[timestamp]');
    console.log('🔗 Join Link: [Frontend URL]/interview/[roomName]?token=[token]');
    console.log('');
    console.log('Please join when you\'re ready for the interview. The link is valid for 1 hour.');
    console.log('');
    console.log('Good luck! 🍀');
    
    return response.data;

  } catch (error) {
    console.error('❌ Error submitting application:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

function showLiveKitEnvironmentVariables() {
  console.log('\n🔧 Required Environment Variables:');
  console.log('');
  console.log('# LiveKit Configuration');
  console.log('LIVEKIT_API_KEY=your_livekit_api_key');
  console.log('LIVEKIT_API_SECRET=your_livekit_api_secret');
  console.log('');
  console.log('# Frontend URL for interview links');
  console.log('FRONTEND_URL=http://localhost:3000');
  console.log('');
  console.log('# WhatsApp (already configured)');
  console.log('WHATSAPP_PHONE_NUMBER_ID=your_whatsapp_phone_id');
  console.log('WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id');
}

function showLiveKitRoomMetadata() {
  console.log('\n📋 LiveKit Room Metadata Structure:');
  console.log(JSON.stringify({
    applicationId: "app_id_here",
    candidateId: "candidate_id_here", 
    candidatePhone: "+962799123456",
    jobId: "job_id_here",
    jobTitle: "Software Developer",
    companyId: "company_id_here",
    createdAt: "2025-07-19T01:30:00.000Z",
    type: "interview"
  }, null, 2));
}

function showDatabaseChanges() {
  console.log('\n💾 Database Changes After Application:');
  console.log('');
  console.log('1. LiveKitRoom table:');
  console.log('   - New room created with unique name');
  console.log('   - Metadata includes candidate phone + jobId');
  console.log('   - createdBy set to "system"');
  console.log('');
  console.log('2. Communication table:');
  console.log('   - WhatsApp template message record created');
  console.log('   - type: WHATSAPP');
  console.log('   - direction: OUTBOUND');
  console.log('   - content: "Interview invitation sent to [candidateName] for [jobTitle]"');
  console.log('   - templateName: "cv_received_notification"');
  console.log('   - templateParams: [candidateName, "?phone=+123&jobId=abc&roomName=xyz"]');
  console.log('   - phoneNumber: candidate phone');
  console.log('');
  console.log('3. Application table:');
  console.log('   - companyNotes updated with room info');
  console.log('   - "LiveKit room created: [roomName]. Interview link sent via WhatsApp."');
}

async function runLiveKitIntegrationTests() {
  console.log('🚀 LiveKit + WhatsApp Interview Integration Test\n');
  
  showLiveKitEnvironmentVariables();
  showLiveKitRoomMetadata();
  showDatabaseChanges();
  
  console.log('\n' + '='.repeat(60));
  console.log('🧪 RUNNING INTEGRATION TEST');
  console.log('='.repeat(60));
  
  // Run the actual test (uncomment when ready)
  // await testLiveKitIntegrationFlow();
  
  console.log('\n✅ Integration test setup completed!');
  console.log('\n📝 Next Steps:');
  console.log('1. Configure LiveKit environment variables');
  console.log('2. Replace "your_job_id_here" with actual job ID');
  console.log('3. Create test CV file (./test-cv.pdf)');
  console.log('4. Uncomment the test call above');
  console.log('5. Run the test and check logs for LiveKit room creation');
  console.log('6. Verify WhatsApp message is sent to candidate');
}

runLiveKitIntegrationTests();
