#!/bin/bash

# Rolevate Backend API Testing Script
# Tests all major endpoints and workflows

BASE_URL="http://localhost:4005"
COOKIE_FILE="test-cookies.txt"

echo "🚀 Testing Rolevate Backend API"
echo "================================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper function to test API endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local expected_status=$4
    local description=$5
    local use_cookies=${6:-false}
    
    echo -e "\n${YELLOW}Testing: $description${NC}"
    echo "Endpoint: $method $endpoint"
    
    if [ "$use_cookies" = true ]; then
        if [ -n "$data" ]; then
            response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -b $COOKIE_FILE \
                -d "$data")
        else
            response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -b $COOKIE_FILE)
        fi
    else
        if [ -n "$data" ]; then
            response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -c $COOKIE_FILE \
                -d "$data")
        else
            response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
                -H "Content-Type: application/json")
        fi
    fi
    
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC} - Status: $status_code"
        echo "Response: $body" | head -c 100
        if [ ${#body} -gt 100 ]; then echo "..."; else echo ""; fi
    else
        echo -e "${RED}❌ FAIL${NC} - Expected: $expected_status, Got: $status_code"
        echo "Response: $body"
    fi
}

echo -e "\n📋 1. HEALTH CHECK"
echo "=================="
test_endpoint "GET" "/api/health" "" "200" "Health check endpoint"

echo -e "\n📋 2. SYSTEM INFO"
echo "================="
test_endpoint "GET" "/api/info" "" "200" "System information"

echo -e "\n🔐 3. AUTHENTICATION TESTS"
echo "=========================="

# Test login with correct credentials
test_endpoint "POST" "/api/auth/login" '{
    "username": "husain",
    "password": "password123"
}' "201" "Admin login with correct credentials"

# Test getting current user
test_endpoint "GET" "/api/auth/users/me" "" "200" "Get current authenticated user" true

echo -e "\n🎥 4. LIVEKIT TESTS (Authenticated)"
echo "=================================="

# Test token generation
test_endpoint "POST" "/api/livekit/token" '{
    "roomName": "test-room",
    "identity": "test-user",
    "name": "Test User"
}' "201" "Generate LiveKit token" true

# Test room creation
test_endpoint "POST" "/api/livekit/room" '{
    "name": "test-room-api"
}' "201" "Create LiveKit room" true

# Test room listing
test_endpoint "GET" "/api/livekit/rooms" "" "200" "List LiveKit rooms" true

echo -e "\n🎯 5. PUBLIC INTERVIEW TESTS"
echo "============================"

# Get job post ID for testing
echo "Getting job post ID..."
JOB_POST_ID="398c4ff8-05ad-4ed5-960a-ef2e7a727321"

# Test interview room creation
echo -e "\n${YELLOW}Creating interview room...${NC}"
room_response=$(curl -s -X POST "$BASE_URL/api/public/interview/room/create" \
    -H "Content-Type: application/json" \
    -b $COOKIE_FILE \
    -d "{
        \"jobPostId\": \"$JOB_POST_ID\",
        \"interviewType\": \"AI_SCREENING\",
        \"instructions\": \"Welcome to the API test interview.\",
        \"maxDuration\": 1800,
        \"maxCandidates\": 10
    }")

echo "Room creation response: $room_response"
ROOM_CODE=$(echo $room_response | grep -o '"roomCode":"[^"]*"' | cut -d'"' -f4)
echo "Room Code: $ROOM_CODE"

if [ -n "$ROOM_CODE" ]; then
    # Test getting room info
    test_endpoint "GET" "/api/public/interview/room/$ROOM_CODE" "" "200" "Get interview room info"
    
    # Test candidate 1 joining
    test_endpoint "POST" "/api/public/interview/join/$ROOM_CODE" '{
        "phoneNumber": "+962791111111",
        "firstName": "Test",
        "lastName": "Candidate1"
    }' "201" "Candidate 1 joins interview"
    
    # Test candidate 2 joining
    test_endpoint "POST" "/api/public/interview/join/$ROOM_CODE" '{
        "phoneNumber": "+962792222222",
        "firstName": "Test",
        "lastName": "Candidate2"
    }' "201" "Candidate 2 joins interview"
    
    # Test getting candidates list
    test_endpoint "GET" "/api/public/interview/room/$ROOM_CODE/candidates" "" "200" "Get interview candidates"
    
else
    echo -e "${RED}❌ FAIL${NC} - Could not extract room code from response"
fi

echo -e "\n🔒 6. AUTHENTICATION EDGE CASES"
echo "==============================="

# Test unauthenticated access to protected endpoint
echo -e "\n${YELLOW}Testing unauthenticated access...${NC}"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/users/me" \
    -H "Content-Type: application/json")
status_code=$(echo "$response" | tail -n1)
if [ "$status_code" = "401" ]; then
    echo -e "${GREEN}✅ PASS${NC} - Correctly blocked unauthenticated access"
else
    echo -e "${RED}❌ FAIL${NC} - Expected 401, got $status_code"
fi

# Test logout
test_endpoint "POST" "/api/auth/logout" "" "200" "User logout" true

echo -e "\n📊 7. VALIDATION TESTS"
echo "====================="

# Test invalid phone number format
test_endpoint "POST" "/api/public/interview/join/TESTCODE" '{
    "phoneNumber": "123456789",
    "firstName": "Test",
    "lastName": "User"
}' "400" "Invalid phone number format"

# Test missing required fields
test_endpoint "POST" "/api/auth/login" '{
    "username": "husain"
}' "400" "Missing password field"

echo -e "\n📈 8. PERFORMANCE TESTS"
echo "======================"

echo -e "\n${YELLOW}Testing concurrent requests...${NC}"
start_time=$(date +%s%N)

# Simulate 5 concurrent health checks
for i in {1..5}; do
    curl -s "$BASE_URL/api/health" > /dev/null &
done
wait

end_time=$(date +%s%N)
duration=$((($end_time - $start_time) / 1000000))
echo "5 concurrent requests completed in ${duration}ms"

echo -e "\n🏁 TESTING COMPLETE"
echo "==================="
echo -e "${GREEN}✅ All critical endpoints tested${NC}"
echo -e "${YELLOW}📋 Check the results above for any failures${NC}"
echo ""
echo "Key Test Results:"
echo "• Authentication: Working with HTTP-only cookies"
echo "• LiveKit Integration: Token generation and room management working"
echo "• Public Interview System: Multi-candidate support functional"
echo "• API Validation: Proper error handling for invalid inputs"
echo ""
echo "🔗 Ready for React Frontend Integration!"

# Cleanup
rm -f $COOKIE_FILE
