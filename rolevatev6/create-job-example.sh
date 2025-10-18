#!/bin/bash

# Example: Create a Job using GraphQL
# You need to replace YOUR_AUTH_TOKEN with a real token

GRAPHQL_URL="http://localhost:4005/graphql"
AUTH_TOKEN="YOUR_AUTH_TOKEN"  # Replace with real token from localStorage

echo "Creating a test job..."

curl -X POST $GRAPHQL_URL \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "query": "mutation CreateJob($input: CreateJobInput!) { createJob(input: $input) { id title slug department location salary type deadline status createdAt updatedAt } }",
    "variables": {
      "input": {
        "title": "Senior Full Stack Developer",
        "department": "Engineering",
        "location": "Amman, Jordan",
        "salary": "3000 - 5000 JOD",
        "type": "FULL_TIME",
        "deadline": "2025-12-31T23:59:59.000Z",
        "description": "We are seeking an experienced Full Stack Developer to join our growing team. You will be responsible for developing and maintaining web applications using modern technologies.",
        "shortDescription": "Join our team as a Senior Full Stack Developer",
        "responsibilities": "- Design and develop scalable web applications\n- Write clean, maintainable code\n- Collaborate with cross-functional teams\n- Mentor junior developers\n- Participate in code reviews",
        "requirements": "- 5+ years of experience in full stack development\n- Strong proficiency in React and Node.js\n- Experience with TypeScript\n- Knowledge of GraphQL\n- Experience with PostgreSQL or MongoDB",
        "benefits": "- Competitive salary\n- Health insurance\n- Flexible working hours\n- Remote work options\n- Professional development budget\n- Annual bonus",
        "skills": ["React", "Node.js", "TypeScript", "GraphQL", "PostgreSQL", "Next.js"],
        "experience": "5+ years",
        "education": "Bachelor degree in Computer Science or related field",
        "jobLevel": "SENIOR",
        "workType": "HYBRID",
        "industry": "Technology",
        "companyDescription": "We are a fast-growing technology company focused on building innovative solutions for businesses.",
        "status": "ACTIVE",
        "interviewLanguage": "English",
        "featured": false
      }
    }
  }' | jq '.'

echo -e "\n\nTo get your auth token:"
echo "1. Open browser DevTools (F12)"
echo "2. Go to Application/Storage > Local Storage"
echo "3. Find 'access_token'"
echo "4. Copy the value and replace YOUR_AUTH_TOKEN above"
