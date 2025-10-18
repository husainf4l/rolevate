# Job Mutations CURL Guide

## Overview
This guide shows how to use curl commands to interact with job mutations in the GraphQL API.

## Prerequisites
- Authentication token (JWT)
- GraphQL endpoint: `http://localhost:4000/graphql`

## Get Your Token First
```bash
# Login to get your token
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation Login($email: String!, $password: String!) { login(email: $email, password: $password) { token user { id name email } } }",
    "variables": {
      "email": "your-email@example.com",
      "password": "your-password"
    }
  }'
```

Save the token from the response and use it in the examples below.

---

## 1. Create Job

### Basic Example
```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "query": "mutation CreateJob($input: CreateJobInput!) { createJob(input: $input) { id title department location salary type status createdAt } }",
    "variables": {
      "input": {
        "title": "Senior Full Stack Developer",
        "department": "Engineering",
        "location": "San Francisco, CA",
        "salary": "$120,000 - $180,000",
        "type": "FULL_TIME",
        "deadline": "2025-12-31",
        "description": "We are looking for an experienced Full Stack Developer...",
        "shortDescription": "Join our team as a Senior Full Stack Developer",
        "responsibilities": "- Design and develop web applications\n- Write clean, maintainable code\n- Collaborate with cross-functional teams",
        "requirements": "- 5+ years of experience\n- Strong knowledge of React and Node.js\n- Experience with TypeScript",
        "benefits": "- Health insurance\n- 401k matching\n- Flexible work hours\n- Remote work options",
        "skills": ["JavaScript", "TypeScript", "React", "Node.js", "PostgreSQL"],
        "experience": "5+ years",
        "education": "Bachelor'\''s degree in Computer Science or related field",
        "jobLevel": "SENIOR",
        "workType": "HYBRID",
        "industry": "Technology",
        "companyDescription": "Leading tech company focused on innovation",
        "status": "ACTIVE"
      }
    }
  }'
```

### Complete Example with All Fields
```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d @- << 'EOF'
{
  "query": "mutation CreateJob($input: CreateJobInput!) { createJob(input: $input) { id title department location salary type deadline description shortDescription responsibilities requirements benefits skills experience education jobLevel workType industry companyDescription status featured createdAt updatedAt postedBy { id name email } } }",
  "variables": {
    "input": {
      "title": "Senior Software Engineer",
      "department": "Engineering",
      "location": "Remote",
      "salary": "$150,000 - $200,000",
      "type": "FULL_TIME",
      "deadline": "2025-12-31",
      "description": "We are seeking a talented Senior Software Engineer to join our dynamic team. You will be responsible for designing, developing, and maintaining scalable web applications using modern technologies. This role offers the opportunity to work on challenging projects and make a significant impact on our product.",
      "shortDescription": "Join our team as a Senior Software Engineer and build amazing products",
      "responsibilities": "• Lead the design and development of new features\n• Write clean, maintainable, and well-tested code\n• Mentor junior developers\n• Participate in code reviews\n• Collaborate with product managers and designers\n• Optimize application performance",
      "requirements": "• 5+ years of professional software development experience\n• Strong proficiency in JavaScript/TypeScript\n• Experience with React, Node.js, and modern web frameworks\n• Solid understanding of RESTful APIs and GraphQL\n• Experience with PostgreSQL or other relational databases\n• Excellent problem-solving skills\n• Strong communication skills",
      "benefits": "• Competitive salary and equity\n• Comprehensive health, dental, and vision insurance\n• 401(k) with company match\n• Unlimited PTO\n• Remote work flexibility\n• Professional development budget\n• Latest MacBook Pro and equipment\n• Team building events",
      "skills": ["JavaScript", "TypeScript", "React", "Node.js", "GraphQL", "PostgreSQL", "Docker", "AWS"],
      "experience": "5+ years",
      "education": "Bachelor's degree in Computer Science or equivalent experience",
      "jobLevel": "SENIOR",
      "workType": "REMOTE",
      "industry": "Technology",
      "companyDescription": "We are a fast-growing technology company building innovative solutions that help businesses scale. Our team is passionate about creating high-quality products and fostering a collaborative work environment.",
      "status": "ACTIVE",
      "featured": false
    }
  }
}
EOF
```

---

## 2. Update Job

**Important:** Based on the GraphQL schema analysis, the backend **DOES NOT have an `updateJob` mutation**. 

### Current Status: ❌ NOT AVAILABLE

The error you're seeing is because the backend schema only has:
- `createJob` mutation
- No `updateJob` mutation
- No `UpdateJobInput` type

### What You Can Do:

#### Option 1: Contact Backend Team
Ask them to implement the `updateJob` mutation with this signature:
```graphql
type Mutation {
  updateJob(input: UpdateJobInput!): Job
}

input UpdateJobInput {
  id: ID!
  title: String
  department: String
  location: String
  salary: String
  type: JobType
  deadline: String
  description: String
  shortDescription: String
  responsibilities: String
  requirements: String
  benefits: String
  skills: [String!]
  experience: String
  education: String
  jobLevel: JobLevel
  workType: WorkType
  industry: String
  companyDescription: String
  status: JobStatus
  featured: Boolean
}
```

#### Option 2: Workaround (Delete and Recreate)
If you need to "update" a job, you'll need to:
1. Get the current job data
2. Delete the job (if delete mutation exists)
3. Create a new job with updated data

---

## 3. Delete Job (If Available)

### Check if Delete Mutation Exists
```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ __type(name: \"Mutation\") { fields { name args { name type { name kind ofType { name } } } } } }"
  }' | grep -i delete
```

### If Delete Exists (Soft Delete)
```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "query": "mutation DeleteJob($id: ID!) { deleteJob(id: $id) }",
    "variables": {
      "id": "YOUR_JOB_ID_HERE"
    }
  }'
```

---

## 4. Query Jobs

### Get All Jobs
```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query GetJobs { jobs { id title department location salary type status createdAt postedBy { id name email } } }"
  }'
```

### Get Single Job by ID
```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query GetJob($id: ID!) { job(id: $id) { id title department location salary type deadline description shortDescription responsibilities requirements benefits skills experience education jobLevel workType industry companyDescription status featured createdAt updatedAt postedBy { id name email } } }",
    "variables": {
      "id": "YOUR_JOB_ID_HERE"
    }
  }'
```

### Get Jobs by Company
```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "query": "query GetMyJobs { myJobs { id title department location salary type status createdAt } }"
  }'
```

---

## Testing Script

Create a file `test-job-mutations.sh`:

```bash
#!/bin/bash

# Configuration
API_URL="http://localhost:4000/graphql"
TOKEN="YOUR_TOKEN_HERE"

echo "=== Testing Job Mutations ==="
echo ""

# Test 1: Create Job
echo "1. Creating a new job..."
CREATE_RESPONSE=$(curl -s -X POST $API_URL \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "mutation CreateJob($input: CreateJobInput!) { createJob(input: $input) { id title status } }",
    "variables": {
      "input": {
        "title": "Test Job Position",
        "department": "Engineering",
        "location": "Remote",
        "salary": "$100,000 - $150,000",
        "type": "FULL_TIME",
        "deadline": "2025-12-31",
        "description": "Test job description",
        "shortDescription": "Test job",
        "responsibilities": "Test responsibilities",
        "requirements": "Test requirements",
        "benefits": "Test benefits",
        "skills": ["JavaScript", "TypeScript"],
        "experience": "3+ years",
        "education": "Bachelor'\''s degree",
        "jobLevel": "MID",
        "workType": "REMOTE",
        "industry": "Technology",
        "companyDescription": "Test company",
        "status": "ACTIVE"
      }
    }
  }')

echo "$CREATE_RESPONSE" | jq '.'

# Extract job ID
JOB_ID=$(echo "$CREATE_RESPONSE" | jq -r '.data.createJob.id')
echo ""
echo "Created Job ID: $JOB_ID"
echo ""

# Test 2: Query the created job
echo "2. Querying the created job..."
curl -s -X POST $API_URL \
  -H "Content-Type: application/json" \
  -d "{
    \"query\": \"query GetJob(\$id: ID!) { job(id: \$id) { id title department location salary type status } }\",
    \"variables\": {
      \"id\": \"$JOB_ID\"
    }
  }" | jq '.'

echo ""
echo "=== Tests Complete ==="
```

Make it executable:
```bash
chmod +x test-job-mutations.sh
```

Run it:
```bash
./test-job-mutations.sh
```

---

## Enums Reference

### JobType
- `FULL_TIME`
- `PART_TIME`
- `CONTRACT`
- `INTERNSHIP`

### JobLevel
- `ENTRY`
- `MID`
- `SENIOR`
- `LEAD`
- `EXECUTIVE`

### WorkType
- `ONSITE`
- `REMOTE`
- `HYBRID`

### JobStatus
- `DRAFT`
- `ACTIVE`
- `CLOSED`
- `DELETED`

---

## Common Errors

### 1. Missing UpdateJob Mutation
```json
{
  "errors": [{
    "message": "Cannot query field \"updateJob\" on type \"Mutation\".",
    "extensions": {
      "code": "GRAPHQL_VALIDATION_FAILED"
    }
  }]
}
```
**Solution:** The backend doesn't have this mutation. Contact the backend team to implement it.

### 2. Unknown Type UpdateJobInput
```json
{
  "errors": [{
    "message": "Unknown type \"UpdateJobInput\".",
    "extensions": {
      "code": "GRAPHQL_VALIDATION_FAILED"
    }
  }]
}
```
**Solution:** The backend doesn't have this input type. Use `createJob` instead or request backend implementation.

### 3. Unauthorized
```json
{
  "errors": [{
    "message": "Unauthorized"
  }]
}
```
**Solution:** Make sure you include a valid JWT token in the Authorization header.

### 4. Invalid Enum Value
```json
{
  "errors": [{
    "message": "Variable \"$input\" got invalid value \"FULLTIME\" at \"input.type\"; Value \"FULLTIME\" does not exist in \"JobType\" enum."
  }]
}
```
**Solution:** Use correct enum values: `FULL_TIME`, `PART_TIME`, `CONTRACT`, or `INTERNSHIP`.

---

## Summary

### ✅ Available Mutations
- `createJob(input: CreateJobInput!): Job`

### ❌ NOT Available (Need Backend Implementation)
- `updateJob(input: UpdateJobInput!): Job`
- `deleteJob(id: ID!): Boolean`
- `hardDeleteJob(id: ID!): Boolean`

### Next Steps
1. Use `createJob` for creating new jobs
2. Contact backend team to implement update/delete mutations
3. Use the provided curl examples to test your implementation
