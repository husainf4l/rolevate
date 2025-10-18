#!/bin/bash

# Quick CURL Examples for Job Mutations
# Replace YOUR_TOKEN_HERE with your actual JWT token

API_URL="http://localhost:4000/graphql"
TOKEN="YOUR_TOKEN_HERE"

echo "Select a test to run:"
echo "1. Create Job"
echo "2. Query Job by ID"
echo "3. Query All Jobs"
echo "4. Get Schema Info"
echo "5. Test Update (will fail - for demonstration)"
read -p "Enter choice (1-5): " choice

case $choice in
  1)
    echo "Creating a new job..."
    curl -X POST "$API_URL" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d '{
        "query": "mutation CreateJob($input: CreateJobInput!) { createJob(input: $input) { id title status } }",
        "variables": {
          "input": {
            "title": "Test Position",
            "department": "Engineering",
            "location": "Remote",
            "salary": "$100k - $150k",
            "type": "FULL_TIME",
            "deadline": "2025-12-31",
            "description": "Test description",
            "shortDescription": "Test short desc",
            "responsibilities": "Test responsibilities",
            "requirements": "Test requirements",
            "benefits": "Test benefits",
            "skills": ["JavaScript", "TypeScript"],
            "experience": "3+ years",
            "education": "Bachelor degree",
            "jobLevel": "MID",
            "workType": "REMOTE",
            "industry": "Tech",
            "companyDescription": "Test company",
            "status": "ACTIVE"
          }
        }
      }' | jq '.'
    ;;
  
  2)
    read -p "Enter Job ID: " job_id
    echo "Querying job $job_id..."
    curl -X POST "$API_URL" \
      -H "Content-Type: application/json" \
      -d "{
        \"query\": \"query GetJob(\$id: ID!) { job(id: \$id) { id title department location salary type status } }\",
        \"variables\": { \"id\": \"$job_id\" }
      }" | jq '.'
    ;;
  
  3)
    echo "Querying all jobs..."
    curl -X POST "$API_URL" \
      -H "Content-Type: application/json" \
      -d '{
        "query": "query { jobs { id title department location status createdAt } }"
      }' | jq '.'
    ;;
  
  4)
    echo "Getting available mutations..."
    curl -X POST "$API_URL" \
      -H "Content-Type: application/json" \
      -d '{
        "query": "{ __type(name: \"Mutation\") { fields { name description args { name type { name kind ofType { name } } } } } }"
      }' | jq '.data.__type.fields[] | select(.name | contains("ob") or contains("Job"))'
    ;;
  
  5)
    read -p "Enter Job ID to update: " job_id
    echo "Attempting to update job (this will fail)..."
    curl -X POST "$API_URL" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d "{
        \"query\": \"mutation UpdateJob(\$input: UpdateJobInput!) { updateJob(input: \$input) { id title } }\",
        \"variables\": {
          \"input\": {
            \"id\": \"$job_id\",
            \"title\": \"Updated Title\"
          }
        }
      }" | jq '.'
    ;;
  
  *)
    echo "Invalid choice"
    ;;
esac
