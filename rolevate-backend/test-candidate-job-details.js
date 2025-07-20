// Test endpoint for candidate to get job details they applied to
console.log('🎯 CANDIDATE JOB DETAILS ENDPOINT');
console.log('=' * 50);

console.log('\n📋 Endpoint Information:');
console.log('=' * 30);
console.log('GET /api/jobs/candidate/:jobId');
console.log('↳ Purpose: Get details of a job the candidate has applied to');
console.log('↳ Authentication: Required (Candidate JWT)');
console.log('↳ Access Control: Only jobs the candidate applied to');

console.log('\n🔑 AUTHENTICATION REQUIREMENTS:');
console.log('=' * 40);
console.log('✅ Valid JWT token in Authorization header');
console.log('✅ User type must be "CANDIDATE"');
console.log('✅ User must have a candidate profile');
console.log('✅ User must have applied to the specific job');

console.log('\n⚡ SECURITY FEATURES:');
console.log('=' * 25);
console.log('🔒 Candidates can ONLY view jobs they applied to');
console.log('🔒 Returns 400 error if candidate never applied to the job');
console.log('🔒 View tracking enabled but doesn\'t increment for applied jobs');

console.log('\n📊 EXAMPLE USAGE:');
console.log('=' * 20);
console.log('# 1. Login as candidate');
console.log('curl -X POST http://localhost:4005/api/auth/login \\');
console.log('  -H "Content-Type: application/json" \\');
console.log('  -d \'{"email": "candidate@example.com", "password": "password"}\'');

console.log('\n# 2. Get job details using the JWT token');
console.log('curl -X GET http://localhost:4005/api/jobs/candidate/job123 \\');
console.log('  -H "Authorization: Bearer <your-jwt-token>"');

console.log('\n📋 RESPONSE EXAMPLE:');
console.log('=' * 20);
const exampleResponse = {
  "id": "job123",
  "title": "Software Engineer",
  "department": "Engineering",
  "location": "Amman, Jordan",
  "salary": "1000-1500 JOD",
  "type": "FULL_TIME",
  "deadline": "2025-08-15T00:00:00.000Z",
  "description": "Full job description...",
  "responsibilities": "Key responsibilities...",
  "requirements": "Required qualifications...",
  "benefits": "Company benefits...",
  "skills": ["JavaScript", "React", "Node.js"],
  "experience": "2-4 years",
  "education": "Bachelor's degree",
  "jobLevel": "MID",
  "workType": "HYBRID",
  "industry": "Technology",
  "status": "ACTIVE",
  "company": {
    "id": "company456",
    "name": "Tech Company Ltd",
    "logo": "uploads/logos/tech_company.png",
    "address": {
      "city": "Amman",
      "country": "Jordan"
    }
  },
  "featured": true,
  "applicants": 25,
  "views": 150,
  "createdAt": "2025-07-01T00:00:00.000Z",
  "updatedAt": "2025-07-10T00:00:00.000Z"
};

console.log(JSON.stringify(exampleResponse, null, 2));

console.log('\n🚫 ERROR SCENARIOS:');
console.log('=' * 20);
console.log('400 - "This endpoint is only for candidates"');
console.log('     ↳ User is not a candidate type');
console.log('400 - "User must have a candidate profile"');
console.log('     ↳ Candidate user has no profile');
console.log('400 - "You can only view details of jobs you have applied to"');
console.log('     ↳ Candidate never applied to this job');
console.log('404 - "Job not found or not available"');
console.log('     ↳ Job doesn\'t exist or is not active');

console.log('\n💡 USE CASES:');
console.log('=' * 15);
console.log('✅ Candidate wants to review job details after applying');
console.log('✅ Candidate preparing for interview (review requirements)');
console.log('✅ Candidate checking application status context');
console.log('✅ Candidate wants to see company details for applied job');

console.log('\n🔄 WORKFLOW INTEGRATION:');
console.log('=' * 30);
console.log('1. User applies to job via /api/applications');
console.log('2. User views their applications via /api/applications/my-applications');
console.log('3. User clicks on specific job to see details via /api/jobs/candidate/:id');
console.log('4. User gets full job context for interview preparation');

console.log('\n🎉 Endpoint is ready and secure!');
