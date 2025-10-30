#!/bin/bash

##############################################################################
# User Security Fix - Test Script
# 
# This script tests the role-based access control for user endpoints
# to ensure CANDIDATE users cannot access admin-only endpoints
#
# Usage: ./test-user-security.sh [--url http://localhost:3000]
##############################################################################

set -e

# Configuration
API_URL="${1:---url}"
if [ "$API_URL" = "--url" ]; then
    API_URL="$2"
else
    API_URL="${API_URL:-http://localhost:3000}"
fi

GRAPHQL_ENDPOINT="${API_URL}/api/graphql"
RESULTS_DIR="test-results"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RESULTS_FILE="${RESULTS_DIR}/security_test_${TIMESTAMP}.json"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create results directory
mkdir -p "${RESULTS_DIR}"

# Test counters
TESTS_TOTAL=0
TESTS_PASSED=0
TESTS_FAILED=0

##############################################################################
# Utility Functions
##############################################################################

print_header() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_test() {
    echo -e "\n${YELLOW}Test: $1${NC}"
}

print_pass() {
    echo -e "${GREEN}✓ PASS: $1${NC}"
    ((TESTS_PASSED++))
}

print_fail() {
    echo -e "${RED}✗ FAIL: $1${NC}"
    ((TESTS_FAILED++))
}

print_info() {
    echo -e "${BLUE}ℹ Info: $1${NC}"
}

# GraphQL Query execution function
execute_graphql_query() {
    local query=$1
    local token=$2
    local description=$3
    
    ((TESTS_TOTAL++))
    
    print_test "$description"
    
    if [ -z "$token" ]; then
        print_info "Executing query without authentication"
    else
        print_info "Executing query with token (${token:0:20}...)"
    fi
    
    local response
    local http_code
    
    if [ -z "$token" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST "${GRAPHQL_ENDPOINT}" \
            -H "Content-Type: application/json" \
            -d "{\"query\": \"$query\"}")
    else
        response=$(curl -s -w "\n%{http_code}" -X POST "${GRAPHQL_ENDPOINT}" \
            -H "Authorization: Bearer ${token}" \
            -H "Content-Type: application/json" \
            -d "{\"query\": \"$query\"}")
    fi
    
    http_code=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | sed '$d')
    
    print_info "HTTP Status: $http_code"
    
    echo "$body"
}

##############################################################################
# Tokens (from JWT payload)
##############################################################################

# CANDIDATE Token
CANDIDATE_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFsLWh1c3NlaW5AcGFwYXlhdHJhZGluZy5jb20iLCJzdWIiOiJiMzNlMGYyYS04Njc5LTQ0MDMtYmNjNy0xODNmZGJjYjg1MzUiLCJ1c2VyVHlwZSI6IkNBTkRJREFURSIsImNvbXBhbnlJZCI6bnVsbCwiaWF0IjoxNzYxODY0NzI4LCJleHAiOjE3NjE5NTExMjgsImF1ZCI6InJvbGV2YXRlLWNsaWVudCIsImlzcyI6InJvbGV2YXRlLWFwaSJ9.UtTY0Rm6xmdhfLLmWc0nYZDcFrIFpiMICQzI76ppgKE"

# Note: Use these to test with real ADMIN/SYSTEM tokens from your database
ADMIN_TOKEN="${ADMIN_TOKEN:-}"
SYSTEM_TOKEN="${SYSTEM_TOKEN:-}"

##############################################################################
# GraphQL Queries
##############################################################################

QUERY_USERS='query { users { id email name userType } }'
QUERY_USER_BY_ID='query { user(id: "b33e0f2a-8679-4403-bcc7-183fdbc8b535") { id email name userType } }'
QUERY_ME='query { me { id email name userType } }'
MUTATION_CREATE_USER='mutation { createUser(input: { email: "test@example.com" password: "password123" name: "Test User" userType: CANDIDATE }) { id email } }'
MUTATION_CHANGE_PASSWORD='mutation { changePassword(input: { currentPassword: "oldpass" newPassword: "newpass" }) }'

##############################################################################
# Test Suite
##############################################################################

main() {
    print_header "User Security Fix - Test Suite"
    
    print_info "API URL: ${GRAPHQL_ENDPOINT}"
    print_info "Test Results will be saved to: ${RESULTS_FILE}"
    
    ##########################################################################
    # Section 1: Unauthenticated Requests
    ##########################################################################
    print_header "Section 1: Unauthenticated Requests"
    
    print_test "Unauthenticated user should NOT access users query"
    response=$(execute_graphql_query "$QUERY_USERS" "" "Get users without token")
    if echo "$response" | grep -q "Forbidden\|Unauthorized"; then
        print_pass "Unauthenticated access blocked"
    else
        print_fail "Unauthenticated access not blocked"
    fi
    
    ##########################################################################
    # Section 2: CANDIDATE User Tests
    ##########################################################################
    print_header "Section 2: CANDIDATE User Tests (Should Be Blocked)"
    
    print_test "CANDIDATE should NOT access users query"
    response=$(execute_graphql_query "$QUERY_USERS" "$CANDIDATE_TOKEN" "CANDIDATE user querying all users")
    if echo "$response" | grep -q "Access denied\|FORBIDDEN\|Required roles"; then
        print_pass "CANDIDATE blocked from users query"
    else
        print_fail "CANDIDATE can access users query (SECURITY ISSUE!)"
    fi
    
    print_test "CANDIDATE should NOT access user by ID query"
    response=$(execute_graphql_query "$QUERY_USER_BY_ID" "$CANDIDATE_TOKEN" "CANDIDATE user querying specific user")
    if echo "$response" | grep -q "Access denied\|FORBIDDEN\|Required roles"; then
        print_pass "CANDIDATE blocked from user by ID query"
    else
        print_fail "CANDIDATE can access user by ID query (SECURITY ISSUE!)"
    fi
    
    print_test "CANDIDATE should NOT create users"
    response=$(execute_graphql_query "$MUTATION_CREATE_USER" "$CANDIDATE_TOKEN" "CANDIDATE user creating new user")
    if echo "$response" | grep -q "Access denied\|FORBIDDEN\|Required roles"; then
        print_pass "CANDIDATE blocked from creating users"
    else
        print_fail "CANDIDATE can create users (SECURITY ISSUE!)"
    fi
    
    print_test "CANDIDATE SHOULD access own profile (me query)"
    response=$(execute_graphql_query "$QUERY_ME" "$CANDIDATE_TOKEN" "CANDIDATE user accessing own profile")
    if echo "$response" | grep -q "b33e0f2a-8679-4403-bcc7-183fdbc8b535\|al-hussein"; then
        print_pass "CANDIDATE can access own profile"
    else
        print_fail "CANDIDATE cannot access own profile"
    fi
    
    print_test "CANDIDATE SHOULD change own password"
    response=$(execute_graphql_query "$MUTATION_CHANGE_PASSWORD" "$CANDIDATE_TOKEN" "CANDIDATE user changing password")
    if echo "$response" | grep -q "true\|error"; then
        print_pass "CANDIDATE change password endpoint works"
    else
        print_fail "CANDIDATE change password endpoint broken"
    fi
    
    ##########################################################################
    # Section 3: ADMIN User Tests (if token provided)
    ##########################################################################
    if [ -n "$ADMIN_TOKEN" ]; then
        print_header "Section 3: ADMIN User Tests (Should Succeed)"
        
        print_test "ADMIN SHOULD access users query"
        response=$(execute_graphql_query "$QUERY_USERS" "$ADMIN_TOKEN" "ADMIN user querying all users")
        if echo "$response" | grep -v "errors\|Access denied\|FORBIDDEN" | grep -q "data"; then
            print_pass "ADMIN can access users query"
        else
            print_fail "ADMIN cannot access users query"
        fi
        
        print_test "ADMIN SHOULD create users"
        response=$(execute_graphql_query "$MUTATION_CREATE_USER" "$ADMIN_TOKEN" "ADMIN user creating new user")
        if echo "$response" | grep -v "errors\|Access denied" | grep -q "data"; then
            print_pass "ADMIN can create users"
        else
            print_fail "ADMIN cannot create users"
        fi
    else
        print_info "ADMIN_TOKEN not provided, skipping ADMIN tests"
        print_info "To test ADMIN endpoints, set ADMIN_TOKEN environment variable"
        print_info "Example: export ADMIN_TOKEN='your-admin-jwt-token' && ./test-user-security.sh"
    fi
    
    ##########################################################################
    # Section 4: SYSTEM User Tests (if token provided)
    ##########################################################################
    if [ -n "$SYSTEM_TOKEN" ]; then
        print_header "Section 4: SYSTEM User Tests (Should Succeed)"
        
        print_test "SYSTEM SHOULD access users query"
        response=$(execute_graphql_query "$QUERY_USERS" "$SYSTEM_TOKEN" "SYSTEM user querying all users")
        if echo "$response" | grep -v "errors\|Access denied\|FORBIDDEN" | grep -q "data"; then
            print_pass "SYSTEM can access users query"
        else
            print_fail "SYSTEM cannot access users query"
        fi
    else
        print_info "SYSTEM_TOKEN not provided, skipping SYSTEM tests"
        print_info "To test SYSTEM endpoints, set SYSTEM_TOKEN environment variable"
        print_info "Example: export SYSTEM_TOKEN='your-system-jwt-token' && ./test-user-security.sh"
    fi
    
    ##########################################################################
    # Test Summary
    ##########################################################################
    print_header "Test Summary"
    
    echo -e "\nTotal Tests Run:    ${BLUE}$TESTS_TOTAL${NC}"
    echo -e "Tests Passed:       ${GREEN}$TESTS_PASSED${NC}"
    echo -e "Tests Failed:       ${RED}$TESTS_FAILED${NC}"
    
    if [ $TESTS_FAILED -eq 0 ]; then
        echo -e "\n${GREEN}✓ All tests passed!${NC}"
        echo -e "${GREEN}✓ User security fix is working correctly${NC}"
        return 0
    else
        echo -e "\n${RED}✗ Some tests failed${NC}"
        echo -e "${RED}✗ User security issue detected${NC}"
        return 1
    fi
}

##############################################################################
# Usage Help
##############################################################################

show_usage() {
    cat << EOF
${BLUE}User Security Test Script${NC}

${YELLOW}Usage:${NC}
  $0 [OPTIONS]

${YELLOW}OPTIONS:${NC}
  --url URL                 GraphQL API URL (default: http://localhost:3000)
  --help                    Show this help message

${YELLOW}Environment Variables:${NC}
  ADMIN_TOKEN              JWT token for ADMIN user (for additional tests)
  SYSTEM_TOKEN             JWT token for SYSTEM user (for additional tests)

${YELLOW}Examples:${NC}
  # Test with default localhost
  $0

  # Test with custom API
  $0 --url http://api.example.com:3000

  # Test with ADMIN token
  export ADMIN_TOKEN="your-jwt-token"
  $0

  # Test with all tokens
  export ADMIN_TOKEN="admin-jwt-token"
  export SYSTEM_TOKEN="system-jwt-token"
  $0 --url http://api.example.com:3000

${YELLOW}Test Results:${NC}
  Results are saved to: ${RESULTS_DIR}/security_test_TIMESTAMP.json

EOF
}

##############################################################################
# Script Execution
##############################################################################

if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    show_usage
    exit 0
fi

# Run main tests
main
EXIT_CODE=$?

echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "Results saved to: ${BLUE}${RESULTS_FILE}${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

exit $EXIT_CODE
