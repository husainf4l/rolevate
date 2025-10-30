# User Security Test Scripts

Comprehensive test scripts to verify that the role-based access control (RBAC) for user endpoints is working correctly.

## Scripts Overview

### 1. Bash Test Script (`test-user-security.sh`)
Cross-platform bash script using `curl` to test GraphQL endpoints.

**Pros:**
- No dependencies (uses system curl)
- Works on macOS, Linux, Windows (with WSL)
- Simple and straightforward
- Good for CI/CD pipelines

**Cons:**
- Less detailed output
- Limited JSON parsing

### 2. Node.js Test Script (`test-user-security.js`)
Node.js script using built-in HTTP module for comprehensive testing.

**Pros:**
- Detailed JSON responses
- Better error handling
- Saves structured test results
- Great for debugging
- Works cross-platform

**Cons:**
- Requires Node.js installed
- Slightly more complex

## Installation & Setup

### Prerequisites
- API must be running and accessible
- Optional: ADMIN and SYSTEM user tokens for comprehensive testing

### Quick Start

#### Option 1: Using Bash Script
```bash
# Make script executable (first time only)
chmod +x test-user-security.sh

# Run with default settings (localhost:3000)
./test-user-security.sh

# Run with custom API URL
./test-user-security.sh --url http://api.example.com:3000

# Show help
./test-user-security.sh --help
```

#### Option 2: Using Node.js Script
```bash
# Run with default settings
node test-user-security.js

# Run with custom API URL
node test-user-security.js --url http://api.example.com:3000

# Run with ADMIN token
node test-user-security.js --admin-token "your-jwt-token"

# Show help
node test-user-security.js --help
```

## Test Cases

Both scripts test the following scenarios:

### Section 1: Unauthenticated Requests
- ✅ Unauthenticated users should NOT access protected endpoints

### Section 2: CANDIDATE User Tests (Should Be Blocked)
- ❌ CANDIDATE should NOT access `users` query
- ❌ CANDIDATE should NOT access `user(id)` query
- ❌ CANDIDATE should NOT create users
- ✅ CANDIDATE SHOULD access own profile (`me` query)
- ✅ CANDIDATE SHOULD change own password

### Section 3: ADMIN User Tests (If ADMIN_TOKEN provided)
- ✅ ADMIN SHOULD access `users` query
- ✅ ADMIN SHOULD access `user(id)` query
- ✅ ADMIN SHOULD create users
- ✅ ADMIN SHOULD update users

### Section 4: SYSTEM User Tests (If SYSTEM_TOKEN provided)
- ✅ SYSTEM SHOULD access `users` query
- ✅ SYSTEM SHOULD access `user(id)` query
- ✅ SYSTEM SHOULD create users
- ✅ SYSTEM SHOULD update users

## Usage Examples

### Example 1: Quick Security Check
```bash
# Check if CANDIDATE users are blocked
./test-user-security.sh

# Expected output shows all CANDIDATE access denied
```

### Example 2: Full Test with ADMIN Token
```bash
# Generate or get your ADMIN JWT token first
export ADMIN_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...."

# Run full test suite
./test-user-security.sh

# Or with Node.js
node test-user-security.js --admin-token "$ADMIN_TOKEN"
```

### Example 3: Production API Testing
```bash
# Test production API
node test-user-security.js --url https://api.production.com

# With custom tokens
ADMIN_TOKEN="prod-admin-token" \
SYSTEM_TOKEN="prod-system-token" \
node test-user-security.js --url https://api.production.com
```

### Example 4: CI/CD Integration
```bash
# In GitHub Actions or similar
- name: Run Security Tests
  run: |
    node test-user-security.js \
      --url ${{ secrets.API_URL }} \
      --admin-token ${{ secrets.ADMIN_TOKEN }} \
      --system-token ${{ secrets.SYSTEM_TOKEN }}
```

## Getting Admin/System Tokens for Testing

### Method 1: Using GraphQL Login
```graphql
mutation {
  login(input: {
    email: "admin@example.com"
    password: "password"
  }) {
    accessToken
  }
}
```

Then use the `accessToken` as your ADMIN_TOKEN:
```bash
export ADMIN_TOKEN="<accessToken from response>"
./test-user-security.sh
```

### Method 2: From Database
```sql
-- Find ADMIN users
SELECT id, email, "userType" FROM "user" WHERE "userType" = 'ADMIN' LIMIT 1;
```

Then manually create a JWT token for that user (or use your login endpoint).

### Method 3: Using Docker
```bash
# From inside the running container
docker-compose exec backend npm run seed
# This seeds test data with known credentials
```

## Test Results

Test results are automatically saved to:
```
test-results/security_test_TIMESTAMP.json
```

### Result Structure
```json
{
  "timestamp": "2025-10-31T...",
  "apiUrl": "http://localhost:3000",
  "testSummary": {
    "total": 10,
    "passed": 10,
    "failed": 0
  },
  "tests": [
    {
      "name": "CANDIDATE blocked from users query",
      "passed": true,
      "timestamp": "2025-10-31T...",
      "response": { ... }
    }
  ]
}
```

## Interpreting Results

### ✓ All Tests Passed
```
Total Tests Run:    10
Tests Passed:       10
Tests Failed:       0

✓ All tests passed!
✓ User security fix is working correctly
```

**Status:** Security fix is properly implemented ✅

### ✗ Some Tests Failed
```
Total Tests Run:    10
Tests Passed:       8
Tests Failed:       2

✗ Some tests failed
✗ User security issue detected
```

**Status:** Security issue detected ⚠️

**Action:** Check the failed tests and review logs:
1. Look at which tests failed
2. Check server logs for errors
3. Verify guards are properly registered
4. Review test results JSON for details

## Troubleshooting

### "Connection refused" Error
**Problem:** Cannot connect to API

**Solution:**
```bash
# Check if API is running
curl http://localhost:3000/api/graphql

# If not running, start it
npm run start
# or
docker-compose up -d backend
```

### "Invalid token" Error
**Problem:** JWT token is expired or invalid

**Solution:**
```bash
# Get a fresh token from login endpoint
# Then set it and retry
export ADMIN_TOKEN="new-token"
./test-user-security.sh
```

### "User type not found" Error
**Problem:** User object doesn't have userType field

**Solution:**
1. Check database for corrupted user records
2. Verify UserType enum in user.entity.ts
3. Restart API server

```bash
# Check database
psql -h localhost -U postgres -d rolevate -c \
  "SELECT id, email, \"userType\" FROM \"user\" LIMIT 5;"
```

### Tests Pass Locally But Fail in CI/CD
**Problem:** Environment differences

**Solution:**
```bash
# Make sure environment variables are set in CI/CD
# Add to your CI/CD configuration:

ADMIN_TOKEN: ${{ secrets.ADMIN_TOKEN }}
SYSTEM_TOKEN: ${{ secrets.SYSTEM_TOKEN }}
API_URL: https://api.staging.com
```

## Advanced Usage

### Custom GraphQL Queries
Edit the test scripts to add custom test cases:

**In bash script:**
```bash
CUSTOM_QUERY='query { customEndpoint { field } }'
response=$(execute_graphql_query "$CUSTOM_QUERY" "$TOKEN" "Custom test")
```

**In Node.js script:**
```javascript
const response = await executeGraphQL(
  'query { customEndpoint { field } }',
  ADMIN_TOKEN
);
```

### Running Specific Tests
You can modify the test scripts to comment out sections:

```bash
# Comment out Section 3 and 4 to test only CANDIDATE
# Find these lines and comment them:
# print_header "Section 3: ADMIN User Tests"
# print_header "Section 4: SYSTEM User Tests"
```

### Continuous Monitoring
```bash
# Run tests every 5 minutes
watch -n 300 'node test-user-security.js'

# Or with cron job
*/5 * * * * cd /path/to/backend && node test-user-security.js >> test-results/cron.log
```

## Performance Testing

To test with multiple concurrent requests:

```bash
# Using GNU Parallel (macOS: brew install parallel)
seq 1 10 | parallel "./test-user-security.sh --iteration {}"

# Using Node.js
node -e "
  const { spawn } = require('child_process');
  for(let i = 0; i < 10; i++) {
    spawn('node', ['test-user-security.js'], { stdio: 'inherit' });
  }
"
```

## Reporting Issues

When reporting test failures, include:

1. **Test script output** - Full console output
2. **Results JSON** - From test-results directory
3. **Server logs** - From Docker or PM2
4. **Environment details:**
   ```bash
   node --version
   npm --version
   bash --version
   curl --version
   ```

Example issue report:
```
Failed Test: CANDIDATE blocked from users query
API URL: http://localhost:3000
Node Version: v18.0.0
Results File: test-results/security_test_2025-10-31_14-30-45.json

Error Details:
...
```

## Support & Documentation

- Main Security Guide: `USER_ENDPOINT_SECURITY.md`
- Debugging Guide: `USER_SECURITY_DEBUG_GUIDE.md`
- Quick Reference: `SECURITY_FIX_QUICK_REFERENCE.md`
- Detailed Changes: `CODE_CHANGES_DETAILED.md`
- Implementation Summary: `USER_SECURITY_FIX_SUMMARY.md`

## License

These test scripts are part of the Rolevate backend security implementation.
