const axios = require('axios');

async function debugCompanyEndpoint() {
  console.log('🔍 Debugging Company Profile Endpoint with Cookies...\n');

  const BASE_URL = 'http://localhost:4005/api';
  const PASSWORD = 'tt55oo77';

  try {
    // Create axios instance with cookie jar
    const axiosInstance = axios.create({
      withCredentials: true,
      baseURL: BASE_URL
    });

    // Step 1: Login
    console.log('1. Logging in with cookies...');
    const loginResponse = await axiosInstance.post('/auth/login', {
      email: 'al-hussein@papayatrading.com',
      password: PASSWORD
    });

    console.log('   ✅ Login successful');
    console.log('   Cookies set:', loginResponse.headers['set-cookie'] ? 'Yes' : 'No');

    // Step 2: Test /auth/me to verify authentication works
    console.log('\n2. Testing /auth/me with cookies...');
    const meResponse = await axiosInstance.get('/auth/me', {
      validateStatus: () => true
    });

    console.log(`   Status: ${meResponse.status}`);
    if (meResponse.status === 200) {
      console.log('   ✅ Authentication working with cookies');
      console.log(`   User: ${meResponse.data.name} (${meResponse.data.userType})`);
    } else {
      console.log('   ❌ Authentication failed');
      console.log('   Response:', meResponse.data);
    }

    // Step 3: Test company profile endpoint
    console.log('\n3. Testing /company/profile with cookies...');
    const profileResponse = await axiosInstance.get('/company/profile', {
      validateStatus: () => true
    });

    console.log(`   Status: ${profileResponse.status}`);
    console.log(`   Data type: ${typeof profileResponse.data}`);
    console.log(`   Data:`, profileResponse.data);

    // Step 4: Test other company endpoints
    console.log('\n4. Testing /company/me/company...');
    const meCompanyResponse = await axiosInstance.get('/company/me/company', {
      validateStatus: () => true
    });

    console.log(`   Status: ${meCompanyResponse.status}`);
    console.log(`   Data:`, meCompanyResponse.data ? 'Present' : 'NULL');
    if (meCompanyResponse.data) {
      console.log(`   Company name: ${meCompanyResponse.data.name}`);
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
    }
  }
}

debugCompanyEndpoint();