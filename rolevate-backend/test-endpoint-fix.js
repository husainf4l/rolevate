// Test the candidate application endpoint
console.log('🧪 TESTING CANDIDATE APPLICATION ENDPOINT');
console.log('=' * 50);

console.log('\n📋 Available Endpoints:');
console.log('✅ GET /api/applications/my-applications');
console.log('   ↳ Get all applications for the candidate');

console.log('✅ GET /api/applications/my-application/:jobId');
console.log('   ↳ Get specific application for a job the candidate applied to');

console.log('\n🔧 Test Command:');
console.log('# Replace cmdailjua00b63shfpg4qhx94 with an actual job ID');
console.log('curl -X GET http://localhost:4005/api/applications/my-application/cmdailjua00b63shfpg4qhx94 \\');
console.log('  -H "Authorization: Bearer <your-candidate-jwt-token>"');

console.log('\n📊 Expected Response:');
const exampleResponse = {
  "id": "app_123",
  "status": "PENDING",
  "appliedAt": "2025-07-15T10:30:00.000Z",
  "coverLetter": "I am interested in this position...",
  "resumeUrl": "uploads/cvs/candidate_cv.pdf",
  "expectedSalary": "1500 JOD",
  "cvAnalysisScore": 85.5,
  "cvAnalysisResults": {
    "overallFit": "Good",
    "summary": "Strong match for the position...",
    "strengths": ["Technical skills", "Experience"],
    "weaknesses": ["Limited in some areas"]
  },
  "job": {
    "id": "cmdailjua00b63shfpg4qhx94",
    "title": "Software Engineer",
    "company": {
      "name": "Tech Company",
      "address": {
        "city": "Amman",
        "country": "Jordan"
      }
    }
  }
};

console.log(JSON.stringify(exampleResponse, null, 2));

console.log('\n🚨 Error Scenarios:');
console.log('404 - Job ID not found or candidate never applied to it');
console.log('401 - No JWT token or invalid token');
console.log('400 - User is not a candidate or no candidate profile');

console.log('\n✅ This should fix the error you encountered!');
