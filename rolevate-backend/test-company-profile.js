const axios = require('axios');

async function testCompanyProfile() {
  console.log('🏢 Testing Company Profile Endpoint...\n');

  const BASE_URL = 'http://localhost:4005/api';
  const PASSWORD = 'tt55oo77';

  // Test 1: Access without authentication (should fail)
  console.log('1. Testing without authentication...');
  try {
    const response = await axios.get(`${BASE_URL}/company/profile`, {
      validateStatus: () => true
    });
    
    console.log(`   Status: ${response.status}`);
    if (response.status === 401) {
      console.log('   ✅ Correctly requires authentication');
    } else {
      console.log('   ❌ Should require authentication');
    }
  } catch (error) {
    console.log('   ✅ Authentication required');
  }

  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 2: Login and check company profile
  console.log('\n2. Testing with authenticated user...');
  try {
    // Login as a COMPANY user
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'al-hussein@papayatrading.com', // This should be a COMPANY user
      password: PASSWORD
    });

    console.log('   ✅ Login successful');
    const token = loginResponse.data.access_token;
    const user = loginResponse.data.user;
    
    console.log(`   User Type: ${user.userType}`);
    console.log(`   Has Company: ${user.company ? 'Yes' : 'No'}`);
    
    if (user.company) {
      console.log(`   Company Name: ${user.company.name}`);
    }

    // Test the profile endpoint
    const profileResponse = await axios.get(`${BASE_URL}/company/profile`, {
      headers: { Authorization: `Bearer ${token}` },
      validateStatus: () => true
    });

    console.log(`   Profile Status: ${profileResponse.status}`);
    
    if (profileResponse.status === 200) {
      if (profileResponse.data) {
        console.log('   ✅ Company profile data returned');
        console.log(`   Company ID: ${profileResponse.data.id}`);
        console.log(`   Company Name: ${profileResponse.data.name}`);
        console.log(`   Industry: ${profileResponse.data.industry}`);
        console.log(`   Subscription: ${profileResponse.data.subscription}`);
      } else {
        console.log('   ⚠️ Profile endpoint returned null/empty - user has no company');
      }
    } else {
      console.log('   ❌ Profile request failed');
      console.log('   Response:', profileResponse.data);
    }

  } catch (error) {
    console.log('   ❌ Test failed:', error.message);
  }

  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 3: Test with CANDIDATE user (should return null)
  console.log('\n3. Testing with CANDIDATE user (should return null)...');
  try {
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'husain.f4l@gmail.com', // This is a CANDIDATE user
      password: PASSWORD
    });

    const token = loginResponse.data.access_token;
    const user = loginResponse.data.user;
    
    console.log(`   User Type: ${user.userType}`);
    
    const profileResponse = await axios.get(`${BASE_URL}/company/profile`, {
      headers: { Authorization: `Bearer ${token}` },
      validateStatus: () => true
    });

    console.log(`   Profile Status: ${profileResponse.status}`);
    
    if (profileResponse.status === 200 && !profileResponse.data) {
      console.log('   ✅ Correctly returns null for CANDIDATE user (no company)');
    } else if (profileResponse.data) {
      console.log('   ⚠️ CANDIDATE user unexpectedly has company data');
    }

  } catch (error) {
    console.log('   ❌ Test failed:', error.message);
  }

  // Test 4: Check all users and their company associations
  console.log('\n4. Checking user-company associations...');
  try {
    const testUsers = [
      'husain.f4l@gmail.com',
      'al-hussein@papayatrading.com',
      'test@example.com',
      'firmaturda@yahoo.com',
      'al-hussein@margogroup.net'
    ];

    for (const email of testUsers) {
      try {
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
          email,
          password: PASSWORD
        });

        const user = loginResponse.data.user;
        console.log(`   ${email}:`);
        console.log(`     - Type: ${user.userType}`);
        console.log(`     - Has Company: ${user.company ? 'Yes (' + user.company.name + ')' : 'No'}`);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.log(`   ${email}: Login failed`);
      }
    }

  } catch (error) {
    console.log('   ❌ User check failed:', error.message);
  }

  console.log('\n🏢 Company profile testing completed!');
}

testCompanyProfile().catch(console.error);