const axios = require('axios');

async function debugSignup() {
  console.log('🔍 Debugging Signup Password Validation...\n');

  const BASE_URL = 'http://localhost:4005/api';
  const weakPasswords = ['123', 'password', 'abc123'];

  for (const password of weakPasswords) {
    try {
      console.log(`Testing password: "${password}"`);
      
      const response = await axios.post(`${BASE_URL}/auth/signup`, {
        email: `test_debug_${Date.now()}@example.com`,
        password: password,
        name: 'Debug Test User',
        userType: 'CANDIDATE'
      }, { 
        validateStatus: () => true,
        timeout: 10000
      });

      console.log(`  Status: ${response.status}`);
      console.log(`  Response:`, response.data);
      
      if (response.status === 400) {
        console.log(`  ✅ Weak password correctly rejected`);
      } else if (response.status === 201 || response.status === 200) {
        console.log(`  ❌ Weak password was accepted - security issue!`);
      } else if (response.status === 429) {
        console.log(`  ⏸️ Rate limited - waiting...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        continue;
      } else {
        console.log(`  ⚠️ Unexpected status: ${response.status}`);
      }
      
      console.log('');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log('  ❌ Server not running');
        break;
      } else {
        console.log(`  Error: ${error.message}`);
      }
    }
  }

  // Test a strong password
  try {
    console.log('Testing strong password: "StrongPass123!"');
    
    const response = await axios.post(`${BASE_URL}/auth/signup`, {
      email: `strong_debug_${Date.now()}@example.com`,
      password: 'StrongPass123!',
      name: 'Strong Debug User',
      userType: 'CANDIDATE'
    }, { 
      validateStatus: () => true,
      timeout: 10000
    });

    console.log(`  Status: ${response.status}`);
    if (response.status === 201 || response.status === 200) {
      console.log(`  ✅ Strong password accepted`);
    } else {
      console.log(`  Response:`, response.data);
    }
    
  } catch (error) {
    console.log(`  Error: ${error.message}`);
  }
}

debugSignup().catch(console.error);