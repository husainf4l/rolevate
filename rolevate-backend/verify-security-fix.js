const axios = require('axios');

async function verifySecurityFix() {
  console.log('🔒 Verifying Security Metrics Fix...\n');

  try {
    // Test without authentication
    const response1 = await axios.get('http://localhost:4005/api/security/metrics', {
      validateStatus: () => true,
      timeout: 5000
    });

    console.log(`Without auth: ${response1.status}`);
    
    if (response1.status === 401) {
      console.log('✅ Security metrics properly protected (401 Unauthorized)');
    } else {
      console.log(`❌ Security metrics may be exposed (${response1.status})`);
    }

    // Wait a bit to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test with authenticated user (non-admin)
    const loginResponse = await axios.post('http://localhost:4005/api/auth/login', {
      email: 'husain.f4l@gmail.com',
      password: 'tt55oo77'
    }, { timeout: 5000 });

    const token = loginResponse.data.access_token;
    
    const response2 = await axios.get('http://localhost:4005/api/security/metrics', {
      headers: { Authorization: `Bearer ${token}` },
      validateStatus: () => true,
      timeout: 5000
    });

    console.log(`With non-admin auth: ${response2.status}`);

    if (response2.status === 401 || response2.status === 403) {
      console.log('✅ Security metrics properly protected from non-admin users');
    } else {
      console.log(`❌ Non-admin user can access metrics (${response2.status})`);
    }

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Server not running');
    } else {
      console.log('Error:', error.message);
    }
  }

  console.log('\n🔒 Security verification completed!');
}

verifySecurityFix();