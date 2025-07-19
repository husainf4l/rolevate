// Test script for enhanced anonymous application with manual fields
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

const API_BASE = 'http://localhost:4005/api';

// Test 1: Anonymous application with manual fields (JSON)
async function testAnonymousApplicationWithFields() {
  console.log('🧪 Testing Anonymous Application with Manual Fields (JSON)...');
  
  const applicationData = {
    jobId: "your_job_id_here", // Replace with actual job ID
    resumeUrl: "./uploads/cvs/sample/resume.pdf", // Replace with actual CV path
    
    // Manual candidate information
    firstName: "John",
    lastName: "Doe", 
    email: "john.doe@example.com",
    phone: "+962799123456",
    portfolioUrl: "https://johndoe.portfolio.com",
    
    // Application details
    coverLetter: "I am very interested in this position and believe my experience aligns well with your requirements.",
    expectedSalary: "5000 JOD",
    noticePeriod: "1 month"
  };

  try {
    console.log('📝 Sending application data:', JSON.stringify(applicationData, null, 2));
    
    const response = await axios.post(`${API_BASE}/applications/anonymous`, applicationData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Anonymous application created successfully!');
    console.log('Response status:', response.status);
    console.log('Application ID:', response.data.id);
    
    if (response.data.candidateCredentials) {
      console.log('🔑 New account created with credentials:');
      console.log('Email:', response.data.candidateCredentials.email);
      console.log('Password:', response.data.candidateCredentials.password);
    }
    
    return response.data;

  } catch (error) {
    console.error('❌ Error creating anonymous application:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Test 2: Apply with CV upload (Multipart form)
async function testApplyWithCVUpload() {
  console.log('\n🧪 Testing Apply with CV Upload (Multipart Form)...');
  
  // Replace with actual CV file path
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
    
    // Add application data
    form.append('jobId', 'your_job_id_here'); // Replace with actual job ID
    form.append('firstName', 'Jane');
    form.append('lastName', 'Smith');
    form.append('email', 'jane.smith@example.com');
    form.append('phone', '+962799654321');
    form.append('portfolioUrl', 'https://janesmith.dev');
    form.append('coverLetter', 'I am excited to apply for this position. My background in software development makes me a great fit.');
    form.append('expectedSalary', '6000 JOD');
    form.append('noticePeriod', '2 weeks');

    console.log('📤 Uploading CV and application data...');

    const response = await axios.post(`${API_BASE}/applications/apply-with-cv`, form, {
      headers: {
        ...form.getHeaders()
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    console.log('✅ CV application submitted successfully!');
    console.log('Response status:', response.status);
    console.log('Application ID:', response.data.id);
    
    if (response.data.candidateCredentials) {
      console.log('🔑 New account created with credentials:');
      console.log('Email:', response.data.candidateCredentials.email);
      console.log('Password:', response.data.candidateCredentials.password);
    }
    
    return response.data;

  } catch (error) {
    console.error('❌ Error uploading CV application:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Test 3: Demonstrate curl commands
function showCurlExamples() {
  console.log('\n📋 CURL Command Examples:');
  
  console.log('\n1️⃣ Anonymous Application (JSON):');
  console.log(`curl -X POST "${API_BASE}/applications/anonymous" \\
  -H "Content-Type: application/json" \\
  -d '{
    "jobId": "your_job_id_here",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com", 
    "phone": "+962799123456",
    "portfolioUrl": "https://johndoe.portfolio.com",
    "resumeUrl": "./uploads/cvs/sample/resume.pdf",
    "coverLetter": "I am interested in this position...",
    "expectedSalary": "5000 JOD",
    "noticePeriod": "1 month"
  }'`);

  console.log('\n2️⃣ Apply with CV Upload (Multipart):');
  console.log(`curl -X POST "${API_BASE}/applications/apply-with-cv" \\
  -F "cv=@./test-cv.pdf" \\
  -F "jobId=your_job_id_here" \\
  -F "firstName=Jane" \\
  -F "lastName=Smith" \\
  -F "email=jane.smith@example.com" \\
  -F "phone=+962799654321" \\
  -F "portfolioUrl=https://janesmith.dev" \\
  -F "coverLetter=I am excited to apply..." \\
  -F "expectedSalary=6000 JOD" \\
  -F "noticePeriod=2 weeks"`);
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Enhanced Anonymous Application Tests...\n');
  
  // Show curl examples
  showCurlExamples();
  
  // Run API tests (uncomment when you have valid job ID and CV file)
  // await testAnonymousApplicationWithFields();
  // await testApplyWithCVUpload();
  
  console.log('\n✅ Test script completed!');
  console.log('\n📝 Notes:');
  console.log('- Replace "your_job_id_here" with actual job ID');
  console.log('- Manual fields take priority over CV-extracted data');
  console.log('- Email and firstName are required (from manual input or CV)');
  console.log('- If email exists, uses existing candidate profile');
  console.log('- If email is new, creates account with random password');
}

runAllTests();
