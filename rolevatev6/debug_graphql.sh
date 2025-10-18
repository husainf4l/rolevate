#!/bin/bash

# GraphQL endpoint
GRAPHQL_URL="http://localhost:4005/api/graphql"

# Replace YOUR_APPLICATION_ID with an actual application ID from your database
APPLICATION_ID="YOUR_APPLICATION_ID"

# GraphQL query
QUERY='
query GetApplicationById($id: String!) {
  application(id: $id) {
    id
    jobId
    job {
      id
      title
      company {
        name
      }
    }
    candidate {
      id
      name
      email
    }
    status
    appliedAt
    coverLetter
    resumeUrl
    expectedSalary
    noticePeriod
    cvAnalysisScore
    cvAnalysisResults
    analyzedAt
    aiCvRecommendations
    aiInterviewRecommendations
    aiSecondInterviewRecommendations
    recommendationsGeneratedAt
    companyNotes
    source
    notes
    aiAnalysis
    interviewScheduled
    reviewedAt
    interviewScheduledAt
    interviewedAt
    rejectedAt
    acceptedAt
    applicationNotes
    createdAt
    updatedAt
  }
}
'

# Variables
VARIABLES="{\"id\": \"$APPLICATION_ID\"}"

# Make the request
curl -X POST "$GRAPHQL_URL" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"$QUERY\", \"variables\": $VARIABLES}" \
  | jq '.'

echo ""
echo "To test with a real application ID:"
echo "1. Get an application ID from your database or from the candidates list"
echo "2. Replace YOUR_APPLICATION_ID in this script with the actual ID"
echo "3. Run: ./debug_graphql.sh"
