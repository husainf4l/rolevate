const axios = require('axios');

async function testWithManualCookie() {
  console.log('🔍 Testing with Manual Cookie Extraction...\n');

  const BASE_URL = 'http://localhost:4005/api';
  const PASSWORD = 'tt55oo77';

  try {
    // Step 1: Login and extract cookies
    console.log('1. Logging in and extracting cookies...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'al-hussein@papayatrading.com',
      password: PASSWORD
    });

    console.log('   ✅ Login successful');
    
    // Extract cookies from headers
    const setCookieHeader = loginResponse.headers['set-cookie'];
    console.log('   Set-Cookie headers:', setCookieHeader);

    if (!setCookieHeader) {
      console.log('   ❌ No cookies received');
      return;
    }

    // Parse cookies
    const cookies = setCookieHeader.map(cookie => cookie.split(';')[0]).join('; ');
    console.log('   Parsed cookies:', cookies.substring(0, 100) + '...');

    // Step 2: Test endpoints with manual cookies
    console.log('\n2. Testing /company/profile with manual cookies...');
    const profileResponse = await axios.get(`${BASE_URL}/company/profile`, {
      headers: {
        'Cookie': cookies
      },
      validateStatus: () => true
    });

    console.log(`   Status: ${profileResponse.status}`);
    console.log(`   Data type: ${typeof profileResponse.data}`);
    console.log(`   Data:`, profileResponse.data);

    if (profileResponse.status === 200 && profileResponse.data) {
      console.log('   ✅ Company profile retrieved successfully!');
      console.log(`   Company: ${profileResponse.data.name || 'Unknown'}`);
    } else if (profileResponse.status === 401) {
      console.log('   ❌ Authentication required');
    } else {
      console.log('   ⚠️ Empty response - user may not have a company');
    }

    // Step 3: Test auth/me with manual cookies
    console.log('\n3. Testing /auth/me with manual cookies...');
    const meResponse = await axios.get(`${BASE_URL}/auth/me`, {
      headers: {
        'Cookie': cookies
      },
      validateStatus: () => true
    });

    console.log(`   Status: ${meResponse.status}`);
    if (meResponse.status === 200) {
      console.log('   ✅ Authentication working');
      console.log(`   User: ${meResponse.data.name} (${meResponse.data.userType})`);
    } else {
      console.log('   ❌ Authentication failed');
    }

    // Step 4: Test other company endpoint
    console.log('\n4. Testing /company/me/company with manual cookies...');
    const meCompanyResponse = await axios.get(`${BASE_URL}/company/me/company`, {
      headers: {
        'Cookie': cookies
      },
      validateStatus: () => true
    });

    console.log(`   Status: ${meCompanyResponse.status}`);
    if (meCompanyResponse.status === 200) {
      console.log(`   Data: ${meCompanyResponse.data ? 'Present' : 'NULL'}`);
      if (meCompanyResponse.data) {
        console.log(`   Company: ${meCompanyResponse.data.name}`);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testWithManualCookie();