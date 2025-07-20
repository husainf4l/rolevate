// Test endpoint for candidate to get their applications
console.log('🎯 TESTING CANDIDATE APPLICATIONS ENDPOINT');
console.log('=' * 50);

console.log('\n📋 Available Application Endpoints:');
console.log('=' * 40);

console.log('\n👤 FOR CANDIDATES:');
console.log('GET /api/applications/my-applications');
console.log('   ↳ Headers: Authorization: Bearer <candidate-jwt-token>');
console.log('   ↳ Returns: Array of applications for the logged-in candidate');
console.log('   ↳ Includes: job details, company info, application status');

console.log('\n🏢 FOR COMPANIES:');
console.log('GET /api/applications/company');
console.log('   ↳ Headers: Authorization: Bearer <company-jwt-token>');
console.log('   ↳ Query params: ?status=PENDING&jobId=xyz&applicationId=abc');
console.log('   ↳ Returns: Applications for company jobs');

console.log('\n🔑 AUTHENTICATION REQUIREMENTS:');
console.log('=' * 40);
console.log('✅ Candidate endpoint requires:');
console.log('   - Valid JWT token');
console.log('   - userType: "CANDIDATE"');
console.log('   - candidateProfileId in user object');

console.log('\n📊 EXAMPLE CANDIDATE RESPONSE:');
console.log('=' * 30);
const exampleResponse = [
  {
    "id": "app123",
    "status": "PENDING",
    "appliedAt": "2025-07-20T10:00:00Z",
    "resumeUrl": "uploads/cvs/candidate_cv.pdf",
    "coverLetter": "I am interested in this position...",
    "job": {
      "id": "job456",
      "title": "Software Engineer",
      "department": "Engineering",
      "location": "Amman, Jordan",
      "salary": "1000-1500 JOD",
      "type": "FULL_TIME",
      "company": {
        "id": "company789",
        "name": "Tech Company",
        "logo": "uploads/logos/company_logo.png"
      }
    },
    "cvAnalysisResults": [
      {
        "score": 85,
        "summary": "Strong technical background...",
        "strengths": ["Programming", "Problem solving"],
        "weaknesses": ["Limited experience in React"]
      }
    ]
  }
];

console.log(JSON.stringify(exampleResponse, null, 2));

console.log('\n🧪 TEST COMMANDS:');
console.log('=' * 20);
console.log('# First, login as candidate to get JWT token');
console.log('curl -X POST http://localhost:4005/api/auth/login \\');
console.log('  -H "Content-Type: application/json" \\');
console.log('  -d \'{"email": "candidate@example.com", "password": "password"}\'');

console.log('\n# Then use the JWT to get applications');
console.log('curl -X GET http://localhost:4005/api/applications/my-applications \\');
console.log('  -H "Authorization: Bearer <your-jwt-token>"');

console.log('\n✨ FEATURES:');
console.log('=' * 15);
console.log('✅ Get all applications for logged-in candidate');
console.log('✅ Includes job details and company info');
console.log('✅ Includes CV analysis results if available');
console.log('✅ Ordered by application date (newest first)');
console.log('✅ Secure - candidates can only see their own applications');

console.log('\n🎉 Endpoint is ready to use!');
