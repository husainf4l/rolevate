#!/bin/bash

# Test script for API Key authentication with mobile apps
# This script tests various GraphQL queries with the system API key

API_KEY="31a29647809f2bf22295b854b30eafd58f50ea1559b0875ad2b55f508aa5215e"
BASE_URL="http://192.168.1.164:4005/api/graphql"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 Testing API Key Authentication"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 1: Basic introspection query (should work without auth)
echo "📝 Test 1: Basic Query (No Auth Required)"
echo "Query: { __typename }"
echo ""
curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{"query":"query { __typename }"}' | jq '.'
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 2: Query with API key - Get all applications
echo "📝 Test 2: Get Applications (With API Key)"
echo "Query: applications"
echo ""
curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{"query":"query { applications { id status candidateName createdAt } }"}' | jq '.'
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 3: Query single application (need to provide an ID)
echo "📝 Test 3: Get Single Application (With API Key)"
echo "Note: Replace 'APPLICATION_ID' with an actual application ID"
echo ""
read -p "Enter Application ID (or press Enter to skip): " APP_ID

if [ -n "$APP_ID" ]; then
  curl -s -X POST "$BASE_URL" \
    -H "Content-Type: application/json" \
    -H "x-api-key: $API_KEY" \
    -d "{\"query\":\"query { application(id: \\\"$APP_ID\\\") { id status candidateName candidateEmail candidatePhone createdAt } }\"}" | jq '.'
  echo ""
else
  echo "Skipped"
  echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 4: Get jobs (public endpoint)
echo "📝 Test 4: Get Jobs (Public - No Auth)"
echo "Query: jobs"
echo ""
curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{"query":"query { jobs { id title location company { name } } }"}' | jq '.'
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 5: Test wrong header name (should fail)
echo "📝 Test 5: Wrong Header Name (Should Fail)"
echo "Using 'X-API-Key' instead of 'x-api-key'"
echo ""
curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{"query":"query { applications { id } }"}' | jq '.'
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 6: Test with Authorization header (should fail for API key)
echo "📝 Test 6: Using Authorization Header (Should Fail)"
echo "Using 'Bearer' prefix with API key"
echo ""
curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d '{"query":"query { applications { id } }"}' | jq '.'
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "✅ Tests Complete!"
echo ""
echo "💡 Tips:"
echo "  - API key MUST be in 'x-api-key' header (lowercase)"
echo "  - No 'Bearer' prefix needed for API keys"
echo "  - Some endpoints require JWT tokens, not API keys"
echo "  - Check backend logs for detailed error messages"
echo ""
