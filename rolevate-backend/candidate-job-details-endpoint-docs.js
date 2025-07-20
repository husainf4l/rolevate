// 🎯 CANDIDATE JOB APPLICATION DETAILS ENDPOINT
console.log('=' * 60);
console.log('📋 ENDPOINT: GET /api/jobs/my-application/:jobId');
console.log('=' * 60);

console.log('\n🎯 PURPOSE:');
console.log('Allow candidates to view detailed information about a specific job they have applied to,');
console.log('including their application status and CV analysis results.');

console.log('\n🔐 AUTHENTICATION:');
console.log('✅ Requires JWT token');
console.log('✅ User must be type "CANDIDATE"');
console.log('✅ User must have a candidate profile');
console.log('✅ User must have actually applied to the specified job');

console.log('\n📝 REQUEST FORMAT:');
console.log('GET /api/jobs/my-application/{jobId}');
console.log('Headers: Authorization: Bearer <candidate-jwt-token>');

console.log('\n📊 RESPONSE FORMAT:');
const exampleResponse = {
  // Job Details
  "id": "job_123",
  "title": "Software Engineer",
  "department": "Engineering",
  "location": "Amman, Jordan",
  "salary": "1000-1500 JOD",
  "type": "FULL_TIME",
  "deadline": "2025-08-20T00:00:00.000Z",
  "description": "We are looking for a skilled software engineer...",
  "responsibilities": "• Develop web applications\n• Collaborate with teams",
  "requirements": "• Bachelor's degree in CS\n• 3+ years experience",
  "benefits": "• Health insurance\n• Flexible hours",
  "skills": ["JavaScript", "React", "Node.js"],
  "experience": "3-5 years",
  "education": "Bachelor's degree",
  "jobLevel": "MID",
  "workType": "HYBRID",
  "industry": "Technology",
  
  // Company Details
  "company": {
    "id": "company_456",
    "name": "Tech Company Ltd",
    "logo": "uploads/logos/company_logo.png",
    "address": {
      "id": "addr_789",
      "street": "123 Main St",
      "city": "Amman",
      "state": "Amman",
      "country": "Jordan",
      "zipCode": "11118"
    }
  },
  
  // Application-Specific Information
  "applicationStatus": "PENDING",
  "appliedAt": "2025-07-15T10:30:00.000Z",
  "cvAnalysisScore": 85.5,
  "cvAnalysisResults": {
    "overallFit": "Good",
    "summary": "Strong technical background with relevant experience in web development. Good match for the position requirements.",
    "strengths": [
      "Solid experience with JavaScript and React",
      "Previous work in similar company size",
      "Good educational background"
    ],
    "weaknesses": [
      "Limited experience with Node.js backend development",
      "Could benefit from more team leadership experience"
    ],
    "recommendations": [
      "Consider highlighting any Node.js projects in portfolio",
      "Prepare examples of collaborative work"
    ]
  }
};

console.log(JSON.stringify(exampleResponse, null, 2));

console.log('\n🔍 WHAT THIS ENDPOINT PROVIDES:');
console.log('=' * 40);
console.log('✅ Complete job details (same as public view)');
console.log('✅ Company information including logo');
console.log('✅ Current application status (PENDING/REVIEWED/ACCEPTED/REJECTED)');
console.log('✅ When the candidate applied to the job');
console.log('✅ CV analysis score (0-100)');
console.log('✅ Detailed CV analysis results from AI');
console.log('✅ Strengths and weaknesses identified');
console.log('✅ AI recommendations for improvement');

console.log('\n🧪 TEST COMMANDS:');
console.log('=' * 20);
console.log('# 1. First, login as candidate');
console.log('curl -X POST http://localhost:4005/api/auth/login \\');
console.log('  -H "Content-Type: application/json" \\');
console.log('  -d \'{"email": "candidate@example.com", "password": "password"}\'');

console.log('\n# 2. Use JWT to get application details for specific job');
console.log('curl -X GET http://localhost:4005/api/jobs/my-application/your-job-id \\');
console.log('  -H "Authorization: Bearer <your-jwt-token>"');

console.log('\n⚠️  ERROR SCENARIOS:');
console.log('=' * 25);
console.log('❌ 401 Unauthorized: No JWT token or invalid token');
console.log('❌ 400 Bad Request: User is not a candidate');
console.log('❌ 400 Bad Request: User doesn\'t have candidate profile');
console.log('❌ 400 Bad Request: User hasn\'t applied to this job');
console.log('❌ 400 Bad Request: Job doesn\'t exist');

console.log('\n🎯 USE CASES:');
console.log('=' * 15);
console.log('📱 Mobile app showing "My Applications" details');
console.log('📊 Candidate dashboard with application tracking');
console.log('🔍 CV feedback system for candidates');
console.log('📈 Application status monitoring');
console.log('💡 Interview preparation based on CV analysis');

console.log('\n🎉 Perfect for candidates to track their application progress!');
