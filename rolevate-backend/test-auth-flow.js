#!/usr/bin/env node

const BASE_URL = 'http://localhost:4005/api';

// Test user credentials
const testUser = {
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User',
  userType: 'CANDIDATE', // Valid options: 'SYSTEM', 'COMPANY', 'CANDIDATE'
  phone: '+1234567890'
};

async function testAuthFlow() {
  console.log('🚀 Testing Authentication Flow...\n');

  try {
    // Test 1: Sign up a new user
    console.log('1. Testing signup...');
    const signupResponse = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });

    if (signupResponse.ok) {
      const signupData = await signupResponse.json();
      console.log('✅ Signup successful:', signupData.message);
      
      // Extract cookies from signup response
      const cookies = signupResponse.headers.get('set-cookie');
      console.log('🍪 Cookies received:', cookies ? 'Yes' : 'No');
      
    } else {
      const errorData = await signupResponse.json();
      console.log('⚠️  Signup failed (user might exist):', errorData.message);
      
      // Try login instead
      console.log('\n2. Trying login instead...');
      const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password,
        }),
      });
      
      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        console.log('✅ Login successful:', loginData.message);
        
        // Extract cookies from login response
        const cookies = loginResponse.headers.get('set-cookie');
        console.log('🍪 Cookies received:', cookies ? 'Yes' : 'No');
        
      } else {
        const loginError = await loginResponse.json();
        console.log('❌ Login failed:', loginError.message);
        return;
      }
    }

  } catch (error) {
    console.error('❌ Error during auth flow:', error.message);
  }
}

// If this script is run directly
if (require.main === module) {
  testAuthFlow();
}

module.exports = { testAuthFlow, testUser };
