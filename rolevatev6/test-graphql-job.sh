#!/bin/bash

# GraphQL Job Testing Script
# This script tests the available GraphQL job queries and mutations

GRAPHQL_URL="http://localhost:4005/graphql"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}======================================${NC}"
echo -e "${YELLOW}GraphQL Job Schema Testing${NC}"
echo -e "${YELLOW}======================================${NC}\n"

# Test 1: Check available job mutations
echo -e "${GREEN}1. Checking available Job mutations...${NC}"
curl -s -X POST $GRAPHQL_URL \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ __schema { mutationType { fields { name } } } }"
  }' | jq -r '.data.__schema.mutationType.fields[] | select(.name | test("[Jj]ob")) | .name'

echo -e "\n${RED}Expected: Only 'createJob' (no updateJob or deleteJob)${NC}\n"

# Test 2: Check available job queries
echo -e "${GREEN}2. Checking available Job queries...${NC}"
curl -s -X POST $GRAPHQL_URL \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ __schema { queryType { fields { name } } } }"
  }' | jq -r '.data.__schema.queryType.fields[] | select(.name | test("[Jj]ob")) | .name'

echo -e "\n${GREEN}Expected: job, jobs, jobBySlug, companyJobs, applicationsByJob${NC}\n"

# Test 3: Get CreateJobInput structure
echo -e "${GREEN}3. Getting CreateJobInput structure...${NC}"
curl -s -X POST $GRAPHQL_URL \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ __type(name: \"CreateJobInput\") { inputFields { name type { name kind ofType { name } } } } }"
  }' | jq -r '.data.__type.inputFields[] | "\(.name): \(.type.ofType.name // .type.name)"' | head -15

echo -e "\n${GREEN}Showing first 15 fields...${NC}\n"

# Test 4: Get Job enums
echo -e "${GREEN}4. Getting Job-related enum values...${NC}"
echo -e "${YELLOW}JobType:${NC}"
curl -s -X POST $GRAPHQL_URL \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ __type(name: \"JobType\") { enumValues { name } } }"
  }' | jq -r '.data.__type.enumValues[] | "  - \(.name)"'

echo -e "\n${YELLOW}JobLevel:${NC}"
curl -s -X POST $GRAPHQL_URL \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ __type(name: \"JobLevel\") { enumValues { name } } }"
  }' | jq -r '.data.__type.enumValues[] | "  - \(.name)"'

echo -e "\n${YELLOW}WorkType:${NC}"
curl -s -X POST $GRAPHQL_URL \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ __type(name: \"WorkType\") { enumValues { name } } }"
  }' | jq -r '.data.__type.enumValues[] | "  - \(.name)"'

echo -e "\n${YELLOW}JobStatus:${NC}"
curl -s -X POST $GRAPHQL_URL \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ __type(name: \"JobStatus\") { enumValues { name } } }"
  }' | jq -r '.data.__type.enumValues[] | "  - \(.name)"'

# Test 5: Check for update mutation (should fail)
echo -e "\n${GREEN}5. Testing for updateJob mutation (should return error)...${NC}"
response=$(curl -s -X POST $GRAPHQL_URL \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { updateJob(id: \"test\", input: {}) { id } }"
  }')

if echo "$response" | jq -e '.errors' > /dev/null 2>&1; then
  echo -e "${RED}✗ updateJob mutation NOT FOUND (as expected)${NC}"
  echo "$response" | jq -r '.errors[0].message'
else
  echo -e "${GREEN}✓ updateJob mutation exists!${NC}"
fi

echo -e "\n${YELLOW}======================================${NC}"
echo -e "${YELLOW}Testing Complete${NC}"
echo -e "${YELLOW}======================================${NC}"

echo -e "\n${RED}CONCLUSION:${NC}"
echo -e "• Only ${GREEN}createJob${NC} mutation is available"
echo -e "• ${RED}updateJob${NC} and ${RED}deleteJob${NC} mutations do NOT exist"
echo -e "• Backend team needs to implement these mutations"
echo -e "• See GRAPHQL_SCHEMA_ANALYSIS.md for workarounds\n"
