#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔐 Step 1: Login to get fresh token${NC}"

# Login to get a fresh token
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:4005/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation Login($email: String!, $password: String!) { login(email: $email, password: $password) { accessToken user { id email name companyId userType } } }",
    "variables": {
      "email": "maria@margogroup.net",
      "password": "your-password-here"
    }
  }')

# Extract token and user info
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.login.accessToken')
USER_EMAIL=$(echo $LOGIN_RESPONSE | jq -r '.data.login.user.email')
COMPANY_ID=$(echo $LOGIN_RESPONSE | jq -r '.data.login.user.companyId')
USER_TYPE=$(echo $LOGIN_RESPONSE | jq -r '.data.login.user.userType')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Login failed!${NC}"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ Login successful!${NC}"
echo "   Email: $USER_EMAIL"
echo "   User Type: $USER_TYPE"
echo "   Company ID: $COMPANY_ID"
echo ""

echo -e "${YELLOW}🎫 Step 2: Create invitation${NC}"

# Create invitation
INVITATION_RESPONSE=$(curl -s -X POST http://localhost:4005/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "mutation CreateInvitation($input: CreateInvitationInput!) { createCompanyInvitation(input: $input) { id code email userType status expiresAt invitationLink } }",
    "variables": {
      "input": {
        "expiresInHours": 168
      }
    }
  }')

# Check for errors
ERRORS=$(echo $INVITATION_RESPONSE | jq -r '.errors')
if [ "$ERRORS" != "null" ]; then
  echo -e "${RED}❌ Invitation creation failed!${NC}"
  echo "$INVITATION_RESPONSE" | jq .
  exit 1
fi

# Extract invitation details
INVITATION_LINK=$(echo $INVITATION_RESPONSE | jq -r '.data.createCompanyInvitation.invitationLink')
INVITATION_CODE=$(echo $INVITATION_RESPONSE | jq -r '.data.createCompanyInvitation.code')
EXPIRES_AT=$(echo $INVITATION_RESPONSE | jq -r '.data.createCompanyInvitation.expiresAt')

echo -e "${GREEN}✅ Invitation created successfully!${NC}"
echo "   Link: $INVITATION_LINK"
echo "   Code: $INVITATION_CODE"
echo "   Expires: $EXPIRES_AT"
echo ""

echo -e "${YELLOW}📋 Step 3: List company invitations${NC}"

# List all invitations
LIST_RESPONSE=$(curl -s -X POST http://localhost:4005/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "query { listCompanyInvitations { id code email userType status expiresAt usedAt } }"
  }')

echo "Company Invitations:"
echo "$LIST_RESPONSE" | jq '.data.listCompanyInvitations'

echo ""
echo -e "${GREEN}✅ All tests completed!${NC}"
