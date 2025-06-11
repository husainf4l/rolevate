#!/usr/bin/env node

/**
 * Rolevate Backend Integration Test Script
 * Tests all API endpoints to ensure frontend-backend compatibility
 */

const API_BASE = 'http://localhost:4005';

// Test utilities
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`)
};

// Test functions
async function testPublicInterviewEndpoints() {
  log.info('Testing Public Interview Endpoints...');
  
  try {
    // Test 1: Get room info (should fail with 404 for invalid room)
    const roomResponse = await fetch(`${API_BASE}/api/public/interview/room/INVALID`);
    if (roomResponse.status === 404) {
      log.success('Room info endpoint responding correctly (404 for invalid room)');
    } else {
      log.warning(`Room info endpoint returned ${roomResponse.status} instead of 404`);
    }

    // Test 2: Test with demo room code if provided
    const demoRoomCode = process.argv[2]; // Pass room code as argument
    if (demoRoomCode) {
      log.info(`Testing with room code: ${demoRoomCode}`);
      const validRoomResponse = await fetch(`${API_BASE}/api/public/interview/room/${demoRoomCode}`);
      
      if (validRoomResponse.ok) {
        const roomData = await validRoomResponse.json();
        log.success(`Room info retrieved: ${roomData.jobTitle} at ${roomData.companyName}`);
        
        // Test join endpoint with dummy data
        const joinResponse = await fetch(`${API_BASE}/api/public/interview/join/${demoRoomCode}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phoneNumber: '+962791234567',
            firstName: 'Test',
            lastName: 'Candidate'
          })
        });
        
        if (joinResponse.ok) {
          const joinData = await joinResponse.json();
          log.success(`Join endpoint working: Got token and serverUrl`);
          log.info(`LiveKit Server: ${joinData.serverUrl}`);
          log.info(`Room Name: ${joinData.roomName}`);
        } else {
          log.error(`Join endpoint failed: ${joinResponse.status}`);
        }
      } else {
        log.error(`Room ${demoRoomCode} not found or backend not accessible`);
      }
    }
    
  } catch (error) {
    log.error(`Public interview test failed: ${error.message}`);
  }
}

async function testAuthEndpoints() {
  log.info('Testing Authentication Endpoints...');
  
  try {
    // Test login endpoint (should fail with invalid credentials)
    const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        username: 'invalid',
        password: 'invalid'
      })
    });
    
    if (loginResponse.status === 401 || loginResponse.status === 400) {
      log.success('Login endpoint responding correctly (rejects invalid credentials)');
    } else {
      log.warning(`Login endpoint returned unexpected status: ${loginResponse.status}`);
    }
    
    // Test with demo credentials
    const demoLoginResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        username: 'husain',
        password: 'password123'
      })
    });
    
    if (demoLoginResponse.ok) {
      const userData = await demoLoginResponse.json();
      log.success(`Demo login successful: ${userData.user.username} (${userData.user.name})`);
      
      // Test authenticated endpoint
      const meResponse = await fetch(`${API_BASE}/api/auth/users/me`, {
        credentials: 'include'
      });
      
      if (meResponse.ok) {
        log.success('Authenticated endpoint /users/me working correctly');
      } else {
        log.error('Authenticated endpoint failed');
      }
    } else {
      log.error('Demo login failed - check backend credentials');
    }
    
  } catch (error) {
    log.error(`Auth test failed: ${error.message}`);
  }
}

async function testLiveKitEndpoints() {
  log.info('Testing LiveKit Endpoints...');
  
  try {
    // These require authentication, so we'll just test if they respond correctly to unauthenticated requests
    const tokenResponse = await fetch(`${API_BASE}/api/livekit/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        roomName: 'test',
        identity: 'test',
        name: 'test'
      })
    });
    
    if (tokenResponse.status === 401 || tokenResponse.status === 403) {
      log.success('LiveKit token endpoint correctly requires authentication');
    } else {
      log.warning(`LiveKit token endpoint returned unexpected status: ${tokenResponse.status}`);
    }
    
  } catch (error) {
    log.error(`LiveKit test failed: ${error.message}`);
  }
}

async function testBackendConnection() {
  log.info('Testing Backend Connection...');
  
  try {
    const response = await fetch(`${API_BASE}/api/health`, {
      timeout: 5000
    });
    
    if (response.ok) {
      log.success('Backend is accessible and responding');
    } else {
      log.warning(`Backend responded with status: ${response.status}`);
    }
  } catch (error) {
    log.error(`Backend connection failed: ${error.message}`);
    log.info('Make sure the backend is running on http://localhost:4005');
  }
}

// Main test runner
async function runTests() {
  console.log('\n🧪 Rolevate Frontend-Backend Integration Tests\n');
  console.log('='.repeat(50));
  
  await testBackendConnection();
  console.log();
  
  await testAuthEndpoints();
  console.log();
  
  await testPublicInterviewEndpoints();
  console.log();
  
  await testLiveKitEndpoints();
  console.log();
  
  console.log('='.repeat(50));
  log.info('Integration tests completed!');
  log.info('Usage: node test-integration.js [ROOM_CODE]');
  console.log();
}

// Run tests
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testPublicInterviewEndpoints, testAuthEndpoints, testLiveKitEndpoints };
