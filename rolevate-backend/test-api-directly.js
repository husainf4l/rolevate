const axios = require('axios');

async function testApiDirectly() {
  console.log('🔍 Testing API directly with debug...\n');

  const BASE_URL = 'http://localhost:4005/api';
  const PASSWORD = 'tt55oo77';

  try {
    // Login first
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'al-hussein@papayatrading.com',
      password: PASSWORD
    });

    const token = loginResponse.data.access_token;
    console.log('   ✅ Login successful');
    console.log(`   Token: ${token ? token.substring(0, 20) + '...' : 'No token received'}`);\n    \n    if (!token) {\n      console.log('   Response:', loginResponse.data);\n      return;\n    }

    // Test the company profile endpoint
    console.log('\n2. Testing company profile endpoint...');
    const profileResponse = await axios.get(`${BASE_URL}/company/profile`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      validateStatus: () => true
    });

    console.log(`   Status: ${profileResponse.status}`);
    console.log(`   Headers:`, Object.keys(profileResponse.headers));
    console.log(`   Data type: ${typeof profileResponse.data}`);
    console.log(`   Data length: ${JSON.stringify(profileResponse.data).length}`);
    console.log(`   Raw data:`, JSON.stringify(profileResponse.data, null, 2));

    // Test other company endpoints for comparison
    console.log('\n3. Testing other company endpoints...');
    
    // Test /me/company endpoint  
    const meCompanyResponse = await axios.get(`${BASE_URL}/company/me/company`, {
      headers: { Authorization: `Bearer ${token}` },
      validateStatus: () => true
    });
    
    console.log(`   /me/company Status: ${meCompanyResponse.status}`);
    console.log(`   /me/company Data:`, meCompanyResponse.data ? 'Present' : 'NULL');

    // Test general company endpoints
    const companiesResponse = await axios.get(`${BASE_URL}/company`, {
      validateStatus: () => true
    });
    
    console.log(`   /company Status: ${companiesResponse.status}`);
    console.log(`   /company Count: ${Array.isArray(companiesResponse.data) ? companiesResponse.data.length : 'Not array'}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.log('   Response status:', error.response.status);
      console.log('   Response data:', error.response.data);
    }
  }
}

testApiDirectly();