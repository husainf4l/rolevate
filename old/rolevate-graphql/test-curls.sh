#!/bin/bash

# ============================================
# cURL Test Scripts for Rolevate Platform
# ============================================
# Run: chmod +x test-curls.sh && ./test-curls.sh
# ============================================

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}Testing Rolevate GraphQL Microservices${NC}"
echo -e "${BLUE}============================================${NC}\n"

# ============================================
# 1. TEST AUTH SERVICE (Port 3001)
# ============================================

echo -e "${YELLOW}1. Testing Auth Service (Port 3001)${NC}\n"

# Test 1.1: Auth Hello
echo -e "${GREEN}Test 1.1: Auth Hello Query${NC}"
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { authHello }"
  }' | jq '.'
echo -e "\n"

# Test 1.2: Register Business User
echo -e "${GREEN}Test 1.2: Register Business User${NC}"
REGISTER_BUSINESS=$(curl -s -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation RegisterBusiness($input: RegisterInput!) { register(input: $input) { message user { id email firstName lastName role isActive createdAt } } }",
    "variables": {
      "input": {
        "email": "business@example.com",
        "password": "SecurePass123!",
        "firstName": "John",
        "lastName": "Business",
        "phoneNumber": "+1234567890",
        "role": "BUSINESS"
      }
    }
  }')
echo "$REGISTER_BUSINESS" | jq '.'
BUSINESS_USER_ID=$(echo "$REGISTER_BUSINESS" | jq -r '.data.register.user.id')
echo -e "\n"

# Test 1.3: Register Candidate User
echo -e "${GREEN}Test 1.3: Register Candidate User${NC}"
REGISTER_CANDIDATE=$(curl -s -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation RegisterCandidate($input: RegisterInput!) { register(input: $input) { message user { id email firstName lastName role isActive createdAt } } }",
    "variables": {
      "input": {
        "email": "candidate@example.com",
        "password": "SecurePass123!",
        "firstName": "Jane",
        "lastName": "Candidate",
        "phoneNumber": "+0987654321",
        "role": "CANDIDATE"
      }
    }
  }')
echo "$REGISTER_CANDIDATE" | jq '.'
CANDIDATE_USER_ID=$(echo "$REGISTER_CANDIDATE" | jq -r '.data.register.user.id')
echo -e "\n"

# Test 1.4: Login Business User
echo -e "${GREEN}Test 1.4: Login Business User${NC}"
LOGIN_BUSINESS=$(curl -s -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation LoginBusiness($input: LoginInput!) { login(input: $input) { accessToken user { id email firstName lastName role } } }",
    "variables": {
      "input": {
        "email": "business@example.com",
        "password": "SecurePass123!"
      }
    }
  }')
echo "$LOGIN_BUSINESS" | jq '.'
BUSINESS_TOKEN=$(echo "$LOGIN_BUSINESS" | jq -r '.data.login.accessToken')
echo -e "\n"

# Test 1.5: Login Candidate User
echo -e "${GREEN}Test 1.5: Login Candidate User${NC}"
LOGIN_CANDIDATE=$(curl -s -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation LoginCandidate($input: LoginInput!) { login(input: $input) { accessToken user { id email firstName lastName role } } }",
    "variables": {
      "input": {
        "email": "candidate@example.com",
        "password": "SecurePass123!"
      }
    }
  }')
echo "$LOGIN_CANDIDATE" | jq '.'
CANDIDATE_TOKEN=$(echo "$LOGIN_CANDIDATE" | jq -r '.data.login.accessToken')
echo -e "\n"

# ============================================
# 2. TEST BUSINESS SERVICE (Port 3003)
# ============================================

echo -e "${YELLOW}2. Testing Business Service (Port 3003)${NC}\n"

# Test 2.1: Company Hello
echo -e "${GREEN}Test 2.1: Company Hello Query${NC}"
curl -X POST http://localhost:3003/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { companyHello }"
  }' | jq '.'
echo -e "\n"

# Test 2.2: Job Hello
echo -e "${GREEN}Test 2.2: Job Hello Query${NC}"
curl -X POST http://localhost:3003/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { jobHello }"
  }' | jq '.'
echo -e "\n"

# Test 2.3: Get All Companies
echo -e "${GREEN}Test 2.3: Get All Companies${NC}"
curl -X POST http://localhost:3003/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { companies { id name description industry website location companySize isActive createdAt } }"
  }' | jq '.'
echo -e "\n"

# Test 2.4: Get All Jobs
echo -e "${GREEN}Test 2.4: Get All Jobs${NC}"
curl -X POST http://localhost:3003/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { jobs { id title description jobType experienceLevel location isRemote salaryMin salaryMax salaryCurrency isActive createdAt } }"
  }' | jq '.'
echo -e "\n"

# ============================================
# 3. TEST CANDIDATE SERVICE (Port 3004)
# ============================================

echo -e "${YELLOW}3. Testing Candidate Service (Port 3004)${NC}\n"

# Test 3.1: Candidate Profile Hello
echo -e "${GREEN}Test 3.1: Candidate Profile Hello Query${NC}"
curl -X POST http://localhost:3004/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { candidateHello }"
  }' | jq '.'
echo -e "\n"

# Test 3.2: Application Hello
echo -e "${GREEN}Test 3.2: Application Hello Query${NC}"
curl -X POST http://localhost:3004/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { applicationHello }"
  }' | jq '.'
echo -e "\n"

# Test 3.3: Get All Candidate Profiles
echo -e "${GREEN}Test 3.3: Get All Candidate Profiles${NC}"
curl -X POST http://localhost:3004/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { candidateProfiles { id userId title bio skills location isOpenToWork yearsOfExperience createdAt } }"
  }' | jq '.'
echo -e "\n"

# Test 3.4: Get All Applications
echo -e "${GREEN}Test 3.4: Get All Applications${NC}"
curl -X POST http://localhost:3004/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { applications { id candidateId jobId status appliedAt createdAt } }"
  }' | jq '.'
echo -e "\n"

# ============================================
# 4. TEST GATEWAY (Port 3000)
# ============================================

echo -e "${YELLOW}4. Testing Gateway (Port 3000)${NC}\n"

# Test 4.1: Gateway Hello
echo -e "${GREEN}Test 4.1: Gateway Hello Query${NC}"
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { hello }"
  }' | jq '.'
echo -e "\n"

# Test 4.2: Gateway Auth Hello
echo -e "${GREEN}Test 4.2: Gateway Auth Hello Query${NC}"
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { authHello }"
  }' | jq '.'
echo -e "\n"

# Test 4.3: Register through Gateway
echo -e "${GREEN}Test 4.3: Register through Gateway${NC}"
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { register(input: { email: \"gateway@example.com\", password: \"SecurePass123!\", firstName: \"Gateway\", lastName: \"User\", phoneNumber: \"+1122334455\", role: CANDIDATE }) { message user { id email firstName lastName role } } }"
  }' | jq '.'
echo -e "\n"

# Test 4.4: Login through Gateway
echo -e "${GREEN}Test 4.4: Login through Gateway${NC}"
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { login(input: { email: \"gateway@example.com\", password: \"SecurePass123!\" }) { accessToken user { id email firstName lastName role } } }"
  }' | jq '.'
echo -e "\n"

# ============================================
# SUMMARY
# ============================================

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}Test Summary${NC}"
echo -e "${BLUE}============================================${NC}"
echo -e "${GREEN}✅ Auth Service Tests Complete${NC}"
echo -e "${GREEN}✅ Business Service Tests Complete${NC}"
echo -e "${GREEN}✅ Candidate Service Tests Complete${NC}"
echo -e "${GREEN}✅ Gateway Tests Complete${NC}"
echo -e "\n${YELLOW}Saved Tokens:${NC}"
echo -e "Business User ID: ${BUSINESS_USER_ID}"
echo -e "Candidate User ID: ${CANDIDATE_USER_ID}"
echo -e "Business Token: ${BUSINESS_TOKEN:0:20}..."
echo -e "Candidate Token: ${CANDIDATE_TOKEN:0:20}..."
echo -e "\n${BLUE}============================================${NC}\n"
