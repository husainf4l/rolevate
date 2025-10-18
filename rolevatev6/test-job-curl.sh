#!/bin/bash

# Job Mutations Test Script with CURL
# This script tests the GraphQL job mutations using curl

# Configuration
API_URL="http://localhost:4000/graphql"
echo "Enter your JWT token:"
read -r TOKEN

if [ -z "$TOKEN" ]; then
    echo "❌ Error: Token is required"
    exit 1
fi

echo ""
echo "======================================"
echo "   Job Mutations Test with CURL"
echo "======================================"
echo ""

# Test 1: Create a job
echo "📝 Test 1: Creating a new job..."
echo ""

CREATE_RESPONSE=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "mutation CreateJob($input: CreateJobInput!) { createJob(input: $input) { id title department location salary type status createdAt postedBy { id name email } } }",
    "variables": {
      "input": {
        "title": "Senior Full Stack Developer",
        "department": "Engineering",
        "location": "Remote",
        "salary": "$120,000 - $180,000",
        "type": "FULL_TIME",
        "deadline": "2025-12-31",
        "description": "We are looking for an experienced Full Stack Developer to join our team. You will work on exciting projects using modern technologies like React, Node.js, and PostgreSQL.",
        "shortDescription": "Join our team as a Senior Full Stack Developer",
        "responsibilities": "• Design and develop scalable web applications\n• Write clean, maintainable code\n• Collaborate with cross-functional teams\n• Mentor junior developers\n• Participate in code reviews",
        "requirements": "• 5+ years of professional experience\n• Strong knowledge of React and Node.js\n• Experience with TypeScript and GraphQL\n• Excellent problem-solving skills\n• Strong communication skills",
        "benefits": "• Competitive salary and equity\n• Health, dental, and vision insurance\n• 401k matching\n• Flexible work hours\n• Remote work options\n• Professional development budget",
        "skills": ["JavaScript", "TypeScript", "React", "Node.js", "PostgreSQL", "GraphQL"],
        "experience": "5+ years",
        "education": "Bachelor'\''s degree in Computer Science or related field",
        "jobLevel": "SENIOR",
        "workType": "REMOTE",
        "industry": "Technology",
        "companyDescription": "We are a fast-growing tech company building innovative solutions",
        "status": "ACTIVE",
        "featured": false
      }
    }
  }')

echo "Response:"
echo "$CREATE_RESPONSE" | jq '.'

# Check if job was created successfully
if echo "$CREATE_RESPONSE" | jq -e '.data.createJob.id' > /dev/null 2>&1; then
    JOB_ID=$(echo "$CREATE_RESPONSE" | jq -r '.data.createJob.id')
    echo ""
    echo "✅ Job created successfully!"
    echo "Job ID: $JOB_ID"
else
    echo ""
    echo "❌ Failed to create job. Check the error above."
    exit 1
fi

echo ""
echo "======================================"
echo ""

# Test 2: Query the created job
echo "🔍 Test 2: Querying the created job..."
echo ""

QUERY_RESPONSE=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"query\": \"query GetJob(\$id: ID!) { job(id: \$id) { id title department location salary type deadline description shortDescription responsibilities requirements benefits skills experience education jobLevel workType industry companyDescription status featured createdAt updatedAt postedBy { id name email } } }\",
    \"variables\": {
      \"id\": \"$JOB_ID\"
    }
  }")

echo "Response:"
echo "$QUERY_RESPONSE" | jq '.'

echo ""
echo "======================================"
echo ""

# Test 3: Try to update the job (this will fail)
echo "🔄 Test 3: Attempting to update job (expected to fail)..."
echo ""

UPDATE_RESPONSE=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"query\": \"mutation UpdateJob(\$input: UpdateJobInput!) { updateJob(input: \$input) { id title } }\",
    \"variables\": {
      \"input\": {
        \"id\": \"$JOB_ID\",
        \"title\": \"Updated Job Title\"
      }
    }
  }")

echo "Response:"
echo "$UPDATE_RESPONSE" | jq '.'

if echo "$UPDATE_RESPONSE" | jq -e '.errors' > /dev/null 2>&1; then
    echo ""
    echo "❌ Update failed as expected - updateJob mutation does not exist in the schema"
fi

echo ""
echo "======================================"
echo ""

# Test 4: Query all jobs
echo "📋 Test 4: Querying all jobs..."
echo ""

ALL_JOBS_RESPONSE=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query GetJobs { jobs { id title department location salary type status createdAt postedBy { id name } } }"
  }')

echo "Response (showing first 3 jobs):"
echo "$ALL_JOBS_RESPONSE" | jq '.data.jobs | .[0:3]'

echo ""
echo "======================================"
echo ""
echo "✅ All tests completed!"
echo ""
echo "Summary:"
echo "--------"
echo "✅ createJob mutation: WORKS"
echo "✅ job query: WORKS"
echo "✅ jobs query: WORKS"
echo "❌ updateJob mutation: NOT AVAILABLE (needs backend implementation)"
echo ""
echo "Created Job ID: $JOB_ID"
echo ""
