#!/bin/bash

# Test Update Job Mutation
# This script demonstrates the correct way to call updateJob

API_URL="http://localhost:4000/graphql"

echo "Enter your JWT token:"
read -r TOKEN

if [ -z "$TOKEN" ]; then
    echo "❌ Error: Token is required"
    exit 1
fi

echo ""
echo "Enter the Job ID to update:"
read -r JOB_ID

if [ -z "$JOB_ID" ]; then
    echo "❌ Error: Job ID is required"
    exit 1
fi

echo ""
echo "======================================"
echo "   Testing Update Job Mutation"
echo "======================================"
echo ""
echo "Job ID: $JOB_ID"
echo ""

# Correct way: id is INSIDE the input object
echo "📝 Updating job (id is inside input object)..."
echo ""

UPDATE_RESPONSE=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"query\": \"mutation UpdateJob(\$input: UpdateJobInput!) { updateJob(input: \$input) { id title department location salary type status updatedAt } }\",
    \"variables\": {
      \"input\": {
        \"id\": \"$JOB_ID\",
        \"title\": \"Updated Job Title - $(date '+%Y-%m-%d %H:%M:%S')\",
        \"salary\": \"\$130,000 - \$190,000\",
        \"status\": \"ACTIVE\"
      }
    }
  }")

echo "Response:"
echo "$UPDATE_RESPONSE" | jq '.'

if echo "$UPDATE_RESPONSE" | jq -e '.data.updateJob.id' > /dev/null 2>&1; then
    echo ""
    echo "✅ Job updated successfully!"
    echo ""
    echo "Updated fields:"
    echo "$UPDATE_RESPONSE" | jq '.data.updateJob'
else
    echo ""
    echo "❌ Failed to update job. Check the error above."
    
    if echo "$UPDATE_RESPONSE" | jq -e '.errors' > /dev/null 2>&1; then
        echo ""
        echo "Error details:"
        echo "$UPDATE_RESPONSE" | jq '.errors'
    fi
fi

echo ""
echo "======================================"
echo ""

# Query the job to verify the update
echo "🔍 Querying job to verify update..."
echo ""

QUERY_RESPONSE=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"query\": \"query GetJob(\$id: ID!) { job(id: \$id) { id title department location salary type status updatedAt } }\",
    \"variables\": {
      \"id\": \"$JOB_ID\"
    }
  }")

echo "Response:"
echo "$QUERY_RESPONSE" | jq '.'

echo ""
echo "======================================"
echo ""
echo "✅ Test complete!"
echo ""
