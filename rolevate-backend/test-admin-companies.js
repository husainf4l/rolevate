const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testAdminCompaniesEndpoint() {
  try {
    console.log('🔄 Testing Admin Companies Endpoint...\n');

    // Step 1: Login as admin to get token
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@rolevate.com',
      password: 'TT%%oo77'
    });

    console.log('✅ Admin login successful');
    const token = loginResponse.data.access_token;
    console.log('🔑 Token received:', token.substring(0, 20) + '...\n');

    // Step 2: Test admin companies endpoint
    console.log('2. Testing GET /admin/companies...');
    
    const companiesResponse = await axios.get(`${BASE_URL}/admin/companies`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      params: {
        page: 1,
        limit: 10,
        search: '' // Optional search term
      }
    });

    console.log('✅ Companies endpoint successful');
    console.log('📊 Response Status:', companiesResponse.status);
    console.log('📋 Companies Data:');
    console.log(JSON.stringify(companiesResponse.data, null, 2));

    // Step 3: Test with search parameter
    console.log('\n3. Testing with search parameter...');
    const searchResponse = await axios.get(`${BASE_URL}/admin/companies`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      params: {
        page: 1,
        limit: 5,
        search: 'tech' // Search for companies with 'tech' in name/email/industry
      }
    });

    console.log('✅ Search endpoint successful');
    console.log('🔍 Search Results:');
    console.log(JSON.stringify(searchResponse.data, null, 2));

    // Generate curl commands
    console.log('\n🌐 CURL COMMANDS:');
    console.log('='.repeat(50));
    
    console.log('\n📌 Basic GET request:');
    console.log(`curl -X GET "${BASE_URL}/admin/companies" \\
  -H "Authorization: Bearer ${token}" \\
  -H "Content-Type: application/json"`);

    console.log('\n📌 With pagination:');
    console.log(`curl -X GET "${BASE_URL}/admin/companies?page=1&limit=10" \\
  -H "Authorization: Bearer ${token}" \\
  -H "Content-Type: application/json"`);

    console.log('\n📌 With search:');
    console.log(`curl -X GET "${BASE_URL}/admin/companies?page=1&limit=10&search=tech" \\
  -H "Authorization: Bearer ${token}" \\
  -H "Content-Type: application/json"`);

    console.log('\n📌 Generic template (replace YOUR_TOKEN):');
    console.log(`curl -X GET "${BASE_URL}/admin/companies?page=1&limit=10" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json"`);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Tip: Make sure the admin user exists and credentials are correct');
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Tip: Make sure the server is running on port 3000');
      console.log('Run: npm start or npm run start:dev');
    }
  }
}

// Run the test
testAdminCompaniesEndpoint();
