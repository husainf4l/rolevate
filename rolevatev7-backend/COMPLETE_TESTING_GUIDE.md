# Complete Testing Guide - User Security Fix

## Overview

Three comprehensive test suites are provided to verify the user endpoint security fix:

1. **Bash Test Script** (`test-user-security.sh`) - Simple curl-based tests
2. **Node.js Test Script** (`test-user-security.js`) - Detailed tests with structured results
3. **Docker Test Runner** (`test-in-docker.sh`) - Containerized tests for CI/CD

## Quick Start

### Option 1: Quick Test (No Dependencies)
```bash
cd /Users/husain/Desktop/rolevate/rolevatev7-backend

# Make sure API is running
npm run start  # or docker-compose up -d backend

# Run quick test
./test-user-security.sh
```

### Option 2: Detailed Test (Node.js)
```bash
# Run with detailed output
node test-user-security.js

# Check results
cat test-results/security_test_*.json | jq
```

### Option 3: Docker Test (Containerized)
```bash
# Run tests in isolated Docker environment
./test-in-docker.sh

# Specify API URL
./test-in-docker.sh --api-url http://localhost:3000
```

## Testing Procedure

### Step 1: Ensure API is Running
```bash
# Option A: Local development
npm run start

# Option B: Docker
docker-compose up -d backend

# Option C: Check if running
curl http://localhost:3000/api/graphql
```

### Step 2: Run Security Tests

#### Basic Test (Default Configuration)
```bash
./test-user-security.sh
```

**Expected Output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
User Security Fix - Test Suite
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Test: Unauthenticated user should NOT access users query
✓ PASS: Unauthenticated access blocked

Test: CANDIDATE should NOT access users query
✓ PASS: CANDIDATE blocked from users query

Test: CANDIDATE SHOULD access own profile (me query)
✓ PASS: CANDIDATE can access own profile

Total Tests Run:    10
Tests Passed:       10
Tests Failed:       0

✓ All tests passed!
✓ User security fix is working correctly
```

### Step 3: Advanced Testing with Admin Token

#### Get Admin Token
```bash
# Option 1: Login via GraphQL
curl -X POST http://localhost:3000/api/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { login(input: { email: \"admin@example.com\" password: \"password\" }) { accessToken } }"
  }' | jq '.data.login.accessToken'

# Option 2: From Docker logs
docker-compose logs backend | grep -i "admin.*token"
```

#### Run Tests with Admin Token
```bash
export ADMIN_TOKEN="<your-admin-jwt-token>"
node test-user-security.js
```

**Expected Output Includes:**
```
Test: ADMIN SHOULD access users query
✓ PASS: ADMIN can access users query
```

### Step 4: Verify Results
```bash
# View test results
ls -la test-results/

# Examine detailed results
cat test-results/security_test_*.json | jq '.testSummary'

# Show only failed tests
cat test-results/security_test_*.json | jq '.tests[] | select(.passed == false)'
```

## Expected Test Results

### Successful Fix Verification
All these tests should **PASS**:

| Test Case | Expected Result | Status |
|-----------|-----------------|--------|
| Unauthenticated user blocked | ✓ Blocked | PASS |
| CANDIDATE blocked from `users` | ✓ Blocked | PASS |
| CANDIDATE blocked from `user(id)` | ✓ Blocked | PASS |
| CANDIDATE blocked from `createUser` | ✓ Blocked | PASS |
| CANDIDATE can access `me` | ✓ Allowed | PASS |
| CANDIDATE can change password | ✓ Allowed | PASS |
| ADMIN can access `users` | ✓ Allowed | PASS |
| ADMIN can create users | ✓ Allowed | PASS |

## Troubleshooting

### Issue: "Connection refused"
```bash
# Error:
curl: (7) Failed to connect to localhost port 3000: Connection refused

# Solution:
# Make sure API is running
npm run start

# Or check Docker
docker-compose ps
docker-compose logs -f backend
```

### Issue: "Unauthenticated access not blocked"
```bash
# Error:
✗ FAIL: Unauthenticated access not blocked

# Solution:
# Check if RolesGuard is properly registered
grep -n "RolesGuard" src/user/user.module.ts

# Rebuild and restart
npm run build
npm run start
```

### Issue: "CANDIDATE can access users query"
```bash
# Error:
✗ FAIL: CANDIDATE can access users query (SECURITY ISSUE!)

# Solution 1: Restart server
npm run start

# Solution 2: Rebuild TypeScript
npm run build

# Solution 3: Check guard registration
grep -A 20 "providers:" src/user/user.module.ts

# Solution 4: Check resolver decorators
grep -B 2 "@UseGuards" src/user/user.resolver.ts
```

### Issue: "Invalid token" with ADMIN_TOKEN
```bash
# Error:
Token verification failed: jwt malformed

# Solution:
# Get a fresh token
export ADMIN_TOKEN="<fresh-jwt-token>"

# Or check token expiry
node -e "console.log(require('jsonwebtoken').decode(process.env.ADMIN_TOKEN))"
```

## Test Scenarios

### Scenario 1: Verify CANDIDATE Access Restrictions
**Goal:** Ensure CANDIDATE users cannot access admin endpoints

**Steps:**
```bash
# Get CANDIDATE token (using provided one)
export CANDIDATE_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFsLWh1c3NlaW5AcGFwYXlhdHJhZGluZy5jb20iLCJzdWIiOiJiMzNlMGYyYS04Njc5LTQ0MDMtYmNjNy0xODNmZGJjYjg1MzUiLCJ1c2VyVHlwZSI6IkNBTkRJREFURSIsImNvbXBhbnlJZCI6bnVsbCwiaWF0IjoxNzYxODY0NzI4LCJleHAiOjE3NjE5NTExMjgsImF1ZCI6InJvbGV2YXRlLWNsaWVudCIsImlzcyI6InJvbGV2YXRlLWFwaSJ9.UtTY0Rm6xmdhfLLmWc0nYZDcFrIFpiMICQzI76ppgKE"

# Run tests
./test-user-security.sh

# Verify all CANDIDATE tests are blocked
grep "CANDIDATE" test-results/security_test_*.json | grep "passed.*false"
```

**Expected Results:**
- All CANDIDATE admin endpoint accesses should be blocked
- CANDIDATE personal endpoints should work

### Scenario 2: Verify ADMIN Access Works
**Goal:** Ensure ADMIN users can access admin endpoints

**Steps:**
```bash
# Get ADMIN token (from login or DB)
export ADMIN_TOKEN="<your-admin-token>"

# Run tests
node test-user-security.js

# Verify ADMIN tests pass
grep "ADMIN" test-results/security_test_*.json | grep "passed.*true"
```

**Expected Results:**
- All ADMIN endpoint accesses should succeed
- ADMIN should be able to list users
- ADMIN should be able to create users

### Scenario 3: Complete Security Audit
**Goal:** Full security verification with all user types

**Steps:**
```bash
# Collect all tokens
export ADMIN_TOKEN="<admin-jwt>"
export SYSTEM_TOKEN="<system-jwt>"
export BUSINESS_TOKEN="<business-jwt>"

# Run comprehensive tests
node test-user-security.js

# Generate report
cat test-results/security_test_*.json | jq '{
  timestamp: .timestamp,
  apiUrl: .apiUrl,
  summary: .testSummary,
  failures: [.tests[] | select(.passed == false)]
}'
```

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Security Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  security-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Start API
        run: npm run start &
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/rolevate

      - name: Wait for API
        run: npx wait-on http://localhost:3000/api/graphql

      - name: Run Security Tests
        run: |
          ADMIN_TOKEN="${{ secrets.TEST_ADMIN_TOKEN }}" \
          SYSTEM_TOKEN="${{ secrets.TEST_SYSTEM_TOKEN }}" \
          node test-user-security.js

      - name: Upload Results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: security-test-results
          path: test-results/

      - name: Report Results
        if: failure()
        run: |
          echo "Security tests failed!"
          cat test-results/security_test_*.json | jq '.tests[] | select(.passed == false)'
          exit 1
```

### Docker Compose with Tests
```yaml
# Add to docker-compose.yml
services:
  security-tests:
    build: .
    depends_on:
      backend:
        condition: service_healthy
    environment:
      API_URL: http://backend:3000
      ADMIN_TOKEN: ${ADMIN_TOKEN}
    command: node test-user-security.js
    volumes:
      - ./test-results:/app/test-results
```

## Performance Testing

### Load Test with Security Checks
```bash
# Test with concurrent requests
ab -n 100 -c 10 \
  -H "Authorization: Bearer $CANDIDATE_TOKEN" \
  http://localhost:3000/api/graphql

# Expected: All requests should be rejected with 403
```

### Stress Test
```bash
# Using Apache Bench for multiple endpoints
for i in {1..100}; do
  curl -s -X POST http://localhost:3000/api/graphql \
    -H "Authorization: Bearer $CANDIDATE_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"query": "query { users { id } }"}' \
    | grep -q "Access denied" && echo "✓" || echo "✗"
done
```

## Monitoring & Logging

### Enable Debug Logging
```bash
# In .env
DEBUG=rolevate:*
LOG_LEVEL=debug

# Run tests
DEBUG=rolevate:* npm run start
```

### Check Logs
```bash
# Docker logs
docker-compose logs -f backend | grep -i "guard\|forbidden\|access denied"

# Local logs (if using PM2)
pm2 logs backend | grep -i "guard\|forbidden"

# Application logs
cat logs/application.log | tail -50
```

## Documentation Files

Related documentation for the security fix:

1. **Main Security Guide**: `USER_ENDPOINT_SECURITY.md`
   - Complete endpoint specifications
   - Security model explanation
   - Testing recommendations

2. **Debugging Guide**: `USER_SECURITY_DEBUG_GUIDE.md`
   - Detailed guard explanation
   - Test case descriptions
   - Troubleshooting procedures

3. **Quick Reference**: `SECURITY_FIX_QUICK_REFERENCE.md`
   - Quick summary of changes
   - Key testing points
   - Deployment checklist

4. **Code Changes**: `CODE_CHANGES_DETAILED.md`
   - Exact before/after code
   - Line-by-line modifications
   - Import changes

5. **Implementation Summary**: `USER_SECURITY_FIX_SUMMARY.md`
   - Root cause analysis
   - Solutions applied
   - Security implications

## Support & Help

### Get Help
```bash
# Show test script help
./test-user-security.sh --help

# Show Node.js test help
node test-user-security.js --help

# Show Docker test help
./test-in-docker.sh --help
```

### Report Issues
Include in bug report:
1. Test script output
2. test-results JSON file
3. API server logs
4. Environment info (node version, OS, etc.)

### Additional Resources
- GraphQL Playground: http://localhost:3000/api/graphql
- API Documentation: See `FRONTEND_APOLLO_CONFIG.md`
- Backend Logs: `docker-compose logs backend`

## Test Maintenance

### Update Tests When Adding Endpoints
Edit test scripts when adding new protected endpoints:

**In test-user-security.js:**
```javascript
// Add new query/mutation test case
printTest('New endpoint should be protected');
try {
  const response = await executeGraphQL(
    'query { newEndpoint { field } }',
    CANDIDATE_TOKEN
  );
  if (isAccessDenied(response)) {
    printPass('New endpoint protected');
    recordTest('New endpoint protected', true);
  }
} catch (e) {
  printError(e.message);
}
```

### Regular Testing Schedule
- **Pre-Deployment**: Always run full test suite
- **Weekly**: Run tests on staging environment
- **Daily**: CI/CD automated tests on every commit

## Success Criteria

✅ **Security Fix is Verified When:**
1. CANDIDATE users get 403 Forbidden on `users` query
2. CANDIDATE users get 403 Forbidden on `user(id)` query
3. CANDIDATE users get 403 Forbidden on `createUser` mutation
4. CANDIDATE users get 403 Forbidden on `updateUser` mutation
5. CANDIDATE users CAN access `me` query
6. CANDIDATE users CAN access `changePassword` mutation
7. ADMIN users CAN access all user management endpoints
8. SYSTEM users CAN access all user management endpoints
9. Unauthenticated users get 403 Forbidden

❌ **Fix Failed If:**
- Any of the above conditions are not met
- Tests time out or fail to connect
- Database queries return unexpected results
