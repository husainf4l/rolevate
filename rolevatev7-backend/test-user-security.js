#!/usr/bin/env node

/**
 * User Security Fix - Automated Test Script
 * 
 * Tests role-based access control for user endpoints
 * Ensures CANDIDATE users cannot access admin-only endpoints
 * 
 * Usage: node test-user-security.js [--url http://localhost:3000] [--token TOKEN]
 */

const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const path = require('path');

// ============================================================================
// Configuration
// ============================================================================

const argv = process.argv.slice(2);
let API_URL = 'http://localhost:3000';
let ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';
let SYSTEM_TOKEN = process.env.SYSTEM_TOKEN || '';

// Parse arguments
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--url' && argv[i + 1]) {
    API_URL = argv[i + 1];
    i++;
  } else if (argv[i] === '--admin-token' && argv[i + 1]) {
    ADMIN_TOKEN = argv[i + 1];
    i++;
  } else if (argv[i] === '--system-token' && argv[i + 1]) {
    SYSTEM_TOKEN = argv[i + 1];
    i++;
  } else if (argv[i] === '--help' || argv[i] === '-h') {
    showUsage();
    process.exit(0);
  }
}

const GRAPHQL_ENDPOINT = `${API_URL}/api/graphql`;
const RESULTS_DIR = 'test-results';
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');
const RESULTS_FILE = path.join(RESULTS_DIR, `security_test_${TIMESTAMP}.json`);

// Color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bright: '\x1b[1m',
};

// ============================================================================
// Tokens
// ============================================================================

// CANDIDATE Token (from the issue report)
const CANDIDATE_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFsLWh1c3NlaW5AcGFwYXlhdHJhZGluZy5jb20iLCJzdWIiOiJiMzNlMGYyYS04Njc5LTQ0MDMtYmNjNy0xODNmZGJjYjg1MzUiLCJ1c2VyVHlwZSI6IkNBTkRJREFURSIsImNvbXBhbnlJZCI6bnVsbCwiaWF0IjoxNzYxODY0NzI4LCJleHAiOjE3NjE5NTExMjgsImF1ZCI6InJvbGV2YXRlLWNsaWVudCIsImlzcyI6InJvbGV2YXRlLWFwaSJ9.UtTY0Rm6xmdhfLLmWc0nYZDcFrIFpiMICQzI76ppgKE';

// ============================================================================
// Test Results
// ============================================================================

const results = {
  timestamp: new Date().toISOString(),
  apiUrl: API_URL,
  testSummary: {
    total: 0,
    passed: 0,
    failed: 0,
  },
  tests: [],
};

// ============================================================================
// Utility Functions
// ============================================================================

function printHeader(title) {
  console.log(`\n${colors.blue}${'═'.repeat(70)}${colors.reset}`);
  console.log(`${colors.blue}${colors.bright}${title}${colors.reset}`);
  console.log(`${colors.blue}${'═'.repeat(70)}${colors.reset}`);
}

function printTest(title) {
  console.log(`\n${colors.yellow}Test: ${title}${colors.reset}`);
}

function printPass(message) {
  console.log(`${colors.green}✓ PASS${colors.reset}: ${message}`);
}

function printFail(message) {
  console.log(`${colors.red}✗ FAIL${colors.reset}: ${message}`);
}

function printInfo(message) {
  console.log(`${colors.blue}ℹ Info${colors.reset}: ${message}`);
}

function printError(message) {
  console.log(`${colors.red}✗ Error${colors.reset}: ${message}`);
}

/**
 * Execute GraphQL query
 */
async function executeGraphQL(query, token = null, description = '') {
  return new Promise((resolve, reject) => {
    const parsedUrl = url.parse(GRAPHQL_ENDPOINT);
    const protocol = parsedUrl.protocol === 'https:' ? https : http;

    const postData = JSON.stringify({ query });

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = protocol.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: jsonData,
            rawBody: data,
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: null,
            rawBody: data,
            parseError: e.message,
          });
        }
      });
    });

    req.on('error', (e) => {
      reject(new Error(`Request failed: ${e.message}`));
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Record test result
 */
function recordTest(testName, passed, details = {}) {
  results.testSummary.total++;
  if (passed) {
    results.testSummary.passed++;
  } else {
    results.testSummary.failed++;
  }

  results.tests.push({
    name: testName,
    passed,
    timestamp: new Date().toISOString(),
    ...details,
  });
}

/**
 * Check if response has error about access denied
 */
function isAccessDenied(response) {
  const body = response.body || {};
  const errors = body.errors || [];
  
  for (const error of errors) {
    const message = (error.message || '').toLowerCase();
    if (message.includes('access denied') || message.includes('forbidden')) {
      return true;
    }
    if (error.extensions && error.extensions.code === 'FORBIDDEN') {
      return true;
    }
  }
  
  return false;
}

/**
 * Check if response has errors
 */
function hasErrors(response) {
  const body = response.body || {};
  return body.errors && body.errors.length > 0;
}

/**
 * Show usage information
 */
function showUsage() {
  console.log(`
${colors.blue}User Security Test Script${colors.reset}

${colors.yellow}Usage:${colors.reset}
  node test-user-security.js [OPTIONS]

${colors.yellow}OPTIONS:${colors.reset}
  --url URL              GraphQL API URL (default: http://localhost:3000)
  --admin-token TOKEN    JWT token for ADMIN user
  --system-token TOKEN   JWT token for SYSTEM user
  --help                 Show this help message

${colors.yellow}Environment Variables:${colors.reset}
  ADMIN_TOKEN            JWT token for ADMIN user
  SYSTEM_TOKEN           JWT token for SYSTEM user

${colors.yellow}Examples:${colors.reset}
  # Test with default localhost
  node test-user-security.js

  # Test with custom API
  node test-user-security.js --url http://api.example.com:3000

  # Test with ADMIN token
  node test-user-security.js --admin-token "your-jwt-token"

  # Test with all tokens
  ADMIN_TOKEN="admin-token" SYSTEM_TOKEN="system-token" \\
    node test-user-security.js --url http://api.example.com:3000

${colors.yellow}Test Results:${colors.reset}
  Results are saved to: test-results/security_test_TIMESTAMP.json
  `);
}

// ============================================================================
// Test Suite
// ============================================================================

async function runTests() {
  printHeader('User Security Fix - Test Suite');

  printInfo(`API URL: ${GRAPHQL_ENDPOINT}`);
  printInfo(`Results will be saved to: ${RESULTS_FILE}`);

  // ========================================================================
  // Section 1: Unauthenticated Requests
  // ========================================================================
  printHeader('Section 1: Unauthenticated Requests');

  printTest('Unauthenticated user should NOT access users query');
  try {
    const response = await executeGraphQL('query { users { id email } }');
    if (isAccessDenied(response) || hasErrors(response)) {
      printPass('Unauthenticated access blocked');
      recordTest('Unauthenticated access blocked', true);
    } else {
      printFail('Unauthenticated access not blocked');
      recordTest('Unauthenticated access blocked', false, { response });
    }
  } catch (e) {
    printError(e.message);
    recordTest('Unauthenticated access blocked', false, { error: e.message });
  }

  // ========================================================================
  // Section 2: CANDIDATE User Tests
  // ========================================================================
  printHeader('Section 2: CANDIDATE User Tests (Should Be Blocked)');

  printTest('CANDIDATE should NOT access users query');
  try {
    const response = await executeGraphQL('query { users { id email name userType } }', CANDIDATE_TOKEN);
    if (isAccessDenied(response)) {
      printPass('CANDIDATE blocked from users query');
      recordTest('CANDIDATE blocked from users query', true);
    } else if (hasErrors(response)) {
      printFail('Query returned error but not access denied');
      recordTest('CANDIDATE blocked from users query', false, { response });
    } else {
      printFail('CANDIDATE can access users query (SECURITY ISSUE!)');
      recordTest('CANDIDATE blocked from users query', false, { response });
    }
  } catch (e) {
    printError(e.message);
    recordTest('CANDIDATE blocked from users query', false, { error: e.message });
  }

  printTest('CANDIDATE should NOT access user by ID query');
  try {
    const response = await executeGraphQL(
      'query { user(id: "b33e0f2a-8679-4403-bcc7-183fdbc8b535") { id email } }',
      CANDIDATE_TOKEN
    );
    if (isAccessDenied(response)) {
      printPass('CANDIDATE blocked from user by ID query');
      recordTest('CANDIDATE blocked from user by ID query', true);
    } else {
      printFail('CANDIDATE can access user by ID query');
      recordTest('CANDIDATE blocked from user by ID query', false, { response });
    }
  } catch (e) {
    printError(e.message);
    recordTest('CANDIDATE blocked from user by ID query', false, { error: e.message });
  }

  printTest('CANDIDATE should NOT create users');
  try {
    const response = await executeGraphQL(
      'mutation { createUser(input: { email: "test@example.com" password: "pass123" name: "Test" userType: CANDIDATE }) { id email } }',
      CANDIDATE_TOKEN
    );
    if (isAccessDenied(response)) {
      printPass('CANDIDATE blocked from creating users');
      recordTest('CANDIDATE blocked from creating users', true);
    } else {
      printFail('CANDIDATE can create users');
      recordTest('CANDIDATE blocked from creating users', false, { response });
    }
  } catch (e) {
    printError(e.message);
    recordTest('CANDIDATE blocked from creating users', false, { error: e.message });
  }

  printTest('CANDIDATE SHOULD access own profile (me query)');
  try {
    const response = await executeGraphQL('query { me { id email userType } }', CANDIDATE_TOKEN);
    if (!hasErrors(response) || !isAccessDenied(response)) {
      printPass('CANDIDATE can access own profile');
      recordTest('CANDIDATE can access own profile', true);
    } else {
      printFail('CANDIDATE cannot access own profile');
      recordTest('CANDIDATE can access own profile', false, { response });
    }
  } catch (e) {
    printError(e.message);
    recordTest('CANDIDATE can access own profile', false, { error: e.message });
  }

  // ========================================================================
  // Section 3: ADMIN User Tests
  // ========================================================================
  if (ADMIN_TOKEN) {
    printHeader('Section 3: ADMIN User Tests (Should Succeed)');

    printTest('ADMIN SHOULD access users query');
    try {
      const response = await executeGraphQL('query { users { id email } }', ADMIN_TOKEN);
      if (!isAccessDenied(response) && response.body?.data) {
        printPass('ADMIN can access users query');
        recordTest('ADMIN can access users query', true);
      } else {
        printFail('ADMIN cannot access users query');
        recordTest('ADMIN can access users query', false, { response });
      }
    } catch (e) {
      printError(e.message);
      recordTest('ADMIN can access users query', false, { error: e.message });
    }
  } else {
    printInfo('ADMIN_TOKEN not provided, skipping ADMIN tests');
    printInfo('To test ADMIN endpoints, set ADMIN_TOKEN or use --admin-token flag');
  }

  // ========================================================================
  // Section 4: SYSTEM User Tests
  // ========================================================================
  if (SYSTEM_TOKEN) {
    printHeader('Section 4: SYSTEM User Tests (Should Succeed)');

    printTest('SYSTEM SHOULD access users query');
    try {
      const response = await executeGraphQL('query { users { id email } }', SYSTEM_TOKEN);
      if (!isAccessDenied(response) && response.body?.data) {
        printPass('SYSTEM can access users query');
        recordTest('SYSTEM can access users query', true);
      } else {
        printFail('SYSTEM cannot access users query');
        recordTest('SYSTEM can access users query', false, { response });
      }
    } catch (e) {
      printError(e.message);
      recordTest('SYSTEM can access users query', false, { error: e.message });
    }
  } else {
    printInfo('SYSTEM_TOKEN not provided, skipping SYSTEM tests');
    printInfo('To test SYSTEM endpoints, set SYSTEM_TOKEN or use --system-token flag');
  }

  // ========================================================================
  // Test Summary
  // ========================================================================
  printHeader('Test Summary');

  console.log(`\nTotal Tests Run:    ${colors.blue}${results.testSummary.total}${colors.reset}`);
  console.log(`Tests Passed:       ${colors.green}${results.testSummary.passed}${colors.reset}`);
  console.log(`Tests Failed:       ${colors.red}${results.testSummary.failed}${colors.reset}`);

  if (results.testSummary.failed === 0) {
    console.log(`\n${colors.green}✓ All tests passed!${colors.reset}`);
    console.log(`${colors.green}✓ User security fix is working correctly${colors.reset}`);
  } else {
    console.log(`\n${colors.red}✗ Some tests failed${colors.reset}`);
    console.log(`${colors.red}✗ User security issue detected${colors.reset}`);
  }

  // Save results
  try {
    if (!fs.existsSync(RESULTS_DIR)) {
      fs.mkdirSync(RESULTS_DIR, { recursive: true });
    }
    fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
    console.log(`\n${colors.blue}Results saved to: ${RESULTS_FILE}${colors.reset}`);
  } catch (e) {
    console.error(`Failed to save results: ${e.message}`);
  }

  console.log(`\n${colors.blue}${'═'.repeat(70)}${colors.reset}\n`);

  return results.testSummary.failed === 0 ? 0 : 1;
}

// ============================================================================
// Main
// ============================================================================

runTests()
  .then((exitCode) => {
    process.exit(exitCode);
  })
  .catch((e) => {
    printError(e.message);
    process.exit(1);
  });
