// Updated test script for anonymous application with proper CV file upload
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');
const path = require('path');

const API_BASE = 'http://localhost:4005/api';

// Test 1: Anonymous application with CV file upload
async function testAnonymousApplicationWithCVUpload() {
  console.log('🧪 Testing Anonymous Application with CV File Upload...');
  
  // Create a test CV file path - replace with your actual CV file
  const cvFilePath = './test-cv.pdf';
  
  if (!fs.existsSync(cvFilePath)) {
    console.log('⚠️ CV file not found at:', cvFilePath);
    console.log('Please create a test CV file or update the path');
    console.log('You can use any PDF file for testing');
    return;
  }

  try {
    const form = new FormData();
    
    // Add CV file - this is required
    form.append('cv', fs.createReadStream(cvFilePath));
    
    // Add application data
    form.append('jobId', 'your_job_id_here'); // Replace with actual job ID
    form.append('firstName', 'John');
    form.append('lastName', 'Doe');
    form.append('email', 'john.doe@example.com');
    form.append('phone', '+962799123456');
    form.append('portfolioUrl', 'https://johndoe.portfolio.com');
    form.append('coverLetter', 'I am very excited to apply for this position. My experience in software development makes me a perfect fit for this role.');
    form.append('expectedSalary', '5000 JOD');
    form.append('noticePeriod', '1 month');

    console.log('📤 Uploading CV and application data...');

    const response = await axios.post(`${API_BASE}/applications/anonymous`, form, {
      headers: {
        ...form.getHeaders()
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    console.log('✅ Anonymous application submitted successfully!');
    console.log('Response status:', response.status);
    console.log('Application ID:', response.data.id);
    console.log('Generated CV URL:', response.data.resumeUrl);
    
    if (response.data.candidateCredentials) {
      console.log('🔑 New account created with credentials:');
      console.log('Email:', response.data.candidateCredentials.email);
      console.log('Password:', response.data.candidateCredentials.password);
    }
    
    return response.data;

  } catch (error) {
    console.error('❌ Error submitting anonymous application:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Test 2: Legacy apply-with-cv endpoint
async function testLegacyApplyWithCV() {
  console.log('\n🧪 Testing Legacy Apply-with-CV Endpoint...');
  
  const cvFilePath = './test-cv.pdf';
  
  if (!fs.existsSync(cvFilePath)) {
    console.log('⚠️ CV file not found at:', cvFilePath);
    return;
  }

  try {
    const form = new FormData();
    
    // Add CV file
    form.append('cv', fs.createReadStream(cvFilePath));
    
    // Add application data
    form.append('jobId', 'your_job_id_here');
    form.append('firstName', 'Jane');
    form.append('lastName', 'Smith');
    form.append('email', 'jane.smith@example.com');
    form.append('phone', '+962799654321');
    form.append('portfolioUrl', 'https://janesmith.dev');
    form.append('coverLetter', 'I am interested in this opportunity...');
    form.append('expectedSalary', '6000 JOD');
    form.append('noticePeriod', '2 weeks');

    console.log('📤 Uploading via legacy endpoint...');

    const response = await axios.post(`${API_BASE}/applications/apply-with-cv`, form, {
      headers: {
        ...form.getHeaders()
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    console.log('✅ Legacy application submitted successfully!');
    console.log('Response status:', response.status);
    console.log('Application ID:', response.data.id);
    
    return response.data;

  } catch (error) {
    console.error('❌ Error with legacy endpoint:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Test 3: Frontend HTML example
function generateHTMLExample() {
  console.log('\n📋 Frontend HTML Form Example:');
  
  const htmlExample = `
<!DOCTYPE html>
<html>
<head>
    <title>Anonymous Job Application</title>
</head>
<body>
    <h2>Apply for Job</h2>
    <form action="${API_BASE}/applications/anonymous" method="POST" enctype="multipart/form-data">
        <!-- Required CV File -->
        <div>
            <label for="cv">CV/Resume (PDF or DOC):</label>
            <input type="file" id="cv" name="cv" accept=".pdf,.doc,.docx" required>
        </div>
        
        <!-- Required Job ID -->
        <div>
            <label for="jobId">Job ID:</label>
            <input type="text" id="jobId" name="jobId" required>
        </div>
        
        <!-- Candidate Information -->
        <div>
            <label for="firstName">First Name:</label>
            <input type="text" id="firstName" name="firstName">
        </div>
        
        <div>
            <label for="lastName">Last Name:</label>
            <input type="text" id="lastName" name="lastName">
        </div>
        
        <div>
            <label for="email">Email:</label>
            <input type="email" id="email" name="email">
        </div>
        
        <div>
            <label for="phone">Phone:</label>
            <input type="tel" id="phone" name="phone">
        </div>
        
        <div>
            <label for="portfolioUrl">Portfolio URL:</label>
            <input type="url" id="portfolioUrl" name="portfolioUrl">
        </div>
        
        <!-- Application Details -->
        <div>
            <label for="coverLetter">Cover Letter:</label>
            <textarea id="coverLetter" name="coverLetter" rows="5"></textarea>
        </div>
        
        <div>
            <label for="expectedSalary">Expected Salary:</label>
            <input type="text" id="expectedSalary" name="expectedSalary">
        </div>
        
        <div>
            <label for="noticePeriod">Notice Period:</label>
            <input type="text" id="noticePeriod" name="noticePeriod">
        </div>
        
        <button type="submit">Submit Application</button>
    </form>
</body>
</html>`;

  console.log(htmlExample);
}

// Test 4: CURL command examples
function showCurlExamples() {
  console.log('\n📋 CURL Command Examples:');
  
  console.log('\n1️⃣ Anonymous Application with CV Upload:');
  console.log(`curl -X POST "${API_BASE}/applications/anonymous" \\
  -F "cv=@./test-cv.pdf" \\
  -F "jobId=your_job_id_here" \\
  -F "firstName=John" \\
  -F "lastName=Doe" \\
  -F "email=john.doe@example.com" \\
  -F "phone=+962799123456" \\
  -F "portfolioUrl=https://johndoe.portfolio.com" \\
  -F "coverLetter=I am interested in this position..." \\
  -F "expectedSalary=5000 JOD" \\
  -F "noticePeriod=1 month"`);

  console.log('\n2️⃣ Legacy Apply-with-CV:');
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
  console.log('🚀 Starting Enhanced Anonymous Application Tests with Proper File Upload...\n');
  
  // Show examples first
  showCurlExamples();
  generateHTMLExample();
  
  // Run API tests (uncomment when you have valid job ID and CV file)
  // await testAnonymousApplicationWithCVUpload();
  // await testLegacyApplyWithCV();
  
  console.log('\n✅ Test script completed!');
  console.log('\n📝 Key Changes:');
  console.log('- ✅ CV files are now uploaded as binary (multipart/form-data)');
  console.log('- ✅ Backend automatically generates resumeUrl from uploaded file');
  console.log('- ✅ No need to provide resumeUrl in request');
  console.log('- ✅ Files are stored in /uploads/cvs/anonymous/ directory');
  console.log('- ✅ Automatic file validation (PDF, DOC, DOCX only)');
  console.log('- ✅ 5MB file size limit');
  console.log('- ✅ AI CV analysis still triggered automatically');
  console.log('\n🔧 Setup Required:');
  console.log('- Replace "your_job_id_here" with actual job ID');
  console.log('- Create a test CV file (./test-cv.pdf) for testing');
  console.log('- Ensure uploads directory is writable');
}

runAllTests();
