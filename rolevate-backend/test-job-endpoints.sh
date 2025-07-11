#!/bin/bash

echo "Testi    "experience": "5+ years",
    "education": "Bachelor'\''s degree in Computer Science or related field",
    "jobLevel": "SENIOR",
    "workType": "HYBRID",
    "industry": "Technology",
    "companyDescription": "We are a leading technology company focused on innovation and excellence. Our team is passionate about building cutting-edge solutions.",
    "cvAnalysisPrompt": "Analyze this CV for a senior software engineer position. Look for TypeScript, React, Node.js experience and assess technical skills."dpoint"
echo "=============================="

# First, let's test the job creation endpoint
echo "Testing POST /api/jobs/create"

# Sample job data
curl -X POST "http://localhost:3000/api/jobs" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Senior Software Engineer",
    "department": "Engineering",
    "location": "Dubai, UAE",
    "salary": "150,000 - 200,000 AED",
    "type": "FULL_TIME",
    "deadline": "2024-02-15T00:00:00.000Z",
    "description": "We are looking for a Senior Software Engineer to join our growing team. You will be responsible for designing, developing, and maintaining high-quality software solutions.",
    "responsibilities": "• Design and develop scalable software solutions\n• Collaborate with cross-functional teams\n• Mentor junior developers\n• Participate in code reviews\n• Stay updated with latest technologies",
    "requirements": "• 5+ years of experience in software development\n• Strong proficiency in TypeScript/JavaScript\n• Experience with React and Node.js\n• Knowledge of database systems\n• Excellent problem-solving skills",
    "benefits": "• Competitive salary\n• Health insurance\n• Flexible working hours\n• Professional development opportunities\n• Annual bonus",
    "skills": ["TypeScript", "React", "Node.js", "PostgreSQL", "AWS"],
    "experience": "5+ years",
    "education": "Bachelor'\''s degree in Computer Science or related field",
    "jobLevel": "SENIOR",
    "workType": "HYBRID",
    "industry": "Technology",
    "companyDescription": "We are a leading technology company focused on innovation and excellence. Our team is passionate about building cutting-edge solutions.",
    "cvAnalysisPrompt": "Analyze the candidate'\''s CV focusing on their technical skills, experience with our tech stack, and leadership potential.",
    "interviewPrompt": "Conduct a technical interview focusing on system design, problem-solving, and cultural fit."
  }'

echo -e "\n\nTesting GET /api/jobs"

# Test getting all jobs
curl -X GET "http://localhost:3000/api/jobs" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

echo -e "\n\nJob endpoints ready for testing!"
echo "Make sure to replace YOUR_JWT_TOKEN with a valid JWT token"
