const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function debugConnection() {
  console.log('🔍 Debugging connection to server...');
  console.log('📍 Base URL:', BASE_URL);
  
  try {
    // Test 1: Check if server is running
    console.log('\n1️⃣ Testing server connectivity...');
    const healthResponse = await axios.get(`${BASE_URL}`, { timeout: 5000 });
    console.log('✅ Server is running! Status:', healthResponse.status);
  } catch (error) {
    console.log('❌ Server connectivity failed:', error.code || error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Server is not running! Please start it with: npm run start:dev');
      return;
    }
  }
  
  try {
    // Test 2: Check auth endpoints
    console.log('\n2️⃣ Testing auth endpoints...');
    
    // Try different possible auth endpoints
    const authEndpoints = ['/auth/login', '/auth/signin', '/login', '/signin'];
    
    for (const endpoint of authEndpoints) {
      try {
        await axios.post(`${BASE_URL}${endpoint}`, {
          email: 'test@test.com',
          password: 'test'
        }, { timeout: 3000 });
      } catch (error) {
        if (error.response && error.response.status !== 404) {
          console.log(`✅ Found auth endpoint: ${endpoint} (Status: ${error.response.status})`);
          break;
        } else if (error.response && error.response.status === 404) {
          console.log(`❌ ${endpoint} - Not found`);
        }
      }
    }
  } catch (error) {
    console.log('❌ Auth endpoint test failed:', error.message);
  }
  
  try {
    // Test 3: Check available routes
    console.log('\n3️⃣ Testing common endpoints...');
    
    const endpoints = [
      '/auth/login',
      '/user',
      '/company',
      '/aiautocomplete',
      '/aiautocomplete/job-analysis'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${BASE_URL}${endpoint}`, { timeout: 3000 });
        console.log(`✅ ${endpoint} - Available (${response.status})`);
      } catch (error) {
        if (error.response) {
          console.log(`🔍 ${endpoint} - Status: ${error.response.status} (${error.response.statusText})`);
        } else {
          console.log(`❌ ${endpoint} - ${error.code || 'Network Error'}`);
        }
      }
    }
  } catch (error) {
    console.log('❌ Endpoint testing failed:', error.message);
  }
  
  console.log('\n📋 Debug Summary:');
  console.log('================');
  console.log('1. Make sure your server is running: npm run start:dev');
  console.log('2. Check if the port is correct (default: 3000)');
  console.log('3. Verify the auth endpoint exists');
  console.log('4. Check server logs for any errors');
}

// Run the debug
debugConnection().catch(console.error);
