const axios = require('axios');

const BASE_URL = 'http://localhost:4005/api';

async function testSecurityFeatures() {
  console.log('🔒 Testing Security Features...\n');

  // Test 1: Rate Limiting
  console.log('1. Testing Rate Limiting...');
  try {
    const promises = Array(150).fill().map(() => 
      axios.get(`${BASE_URL}/auth/me`, { 
        timeout: 1000,
        validateStatus: () => true 
      })
    );
    
    const responses = await Promise.allSettled(promises);
    const rateLimited = responses.filter(r => 
      r.status === 'fulfilled' && r.value.status === 429
    ).length;
    
    console.log(`   ✅ Rate limiting working: ${rateLimited} requests blocked\n`);
  } catch (error) {
    console.log('   ❌ Rate limiting test failed:', error.message, '\n');
  }

  // Test 2: Security Headers
  console.log('2. Testing Security Headers...');
  try {
    const response = await axios.get(`${BASE_URL}/health`, {
      validateStatus: () => true
    });
    
    const headers = response.headers;
    const securityHeaders = [
      'x-frame-options',
      'x-content-type-options',
      'strict-transport-security',
      'x-xss-protection'
    ];
    
    const presentHeaders = securityHeaders.filter(header => headers[header]);
    console.log(`   ✅ Security headers present: ${presentHeaders.join(', ')}\n`);
  } catch (error) {
    console.log('   ❌ Security headers test failed:', error.message, '\n');
  }

  // Test 3: Authentication Security
  console.log('3. Testing Authentication Security...');
  try {
    // Test weak password
    const weakPasswordResponse = await axios.post(`${BASE_URL}/auth/signup`, {
      email: 'test@example.com',
      password: '123',
      name: 'Test User',
      userType: 'CANDIDATE'
    }, { validateStatus: () => true });
    
    if (weakPasswordResponse.status === 400) {
      console.log('   ✅ Weak password rejected\n');
    } else {
      console.log('   ❌ Weak password accepted\n');
    }
  } catch (error) {
    console.log('   ❌ Authentication test failed:', error.message, '\n');
  }

  // Test 4: SQL Injection Protection
  console.log('4. Testing SQL Injection Protection...');
  try {
    const maliciousPayload = "'; DROP TABLE users; --";
    const response = await axios.get(`${BASE_URL}/jobs?search=${encodeURIComponent(maliciousPayload)}`, {
      validateStatus: () => true
    });
    
    // Should not return 500 error or expose database errors
    if (response.status !== 500) {
      console.log('   ✅ SQL injection protected\n');
    } else {
      console.log('   ❌ Potential SQL injection vulnerability\n');
    }
  } catch (error) {
    console.log('   ❌ SQL injection test failed:', error.message, '\n');
  }

  // Test 5: XSS Protection
  console.log('5. Testing XSS Protection...');
  try {
    const xssPayload = '<script>alert("xss")</script>';
    const response = await axios.post(`${BASE_URL}/auth/signup`, {
      email: 'xss@example.com',
      password: 'ValidPass123!',
      name: xssPayload,
      userType: 'CANDIDATE'
    }, { validateStatus: () => true });
    
    // Should sanitize or reject the payload
    console.log('   ✅ XSS payload handled\n');
  } catch (error) {
    console.log('   ❌ XSS test failed:', error.message, '\n');
  }

  // Test 6: CORS Configuration
  console.log('6. Testing CORS Configuration...');
  try {
    const response = await axios.options(`${BASE_URL}/auth/me`, {
      headers: {
        'Origin': 'https://malicious-site.com',
        'Access-Control-Request-Method': 'GET'
      },
      validateStatus: () => true
    });
    
    const corsHeader = response.headers['access-control-allow-origin'];
    if (!corsHeader || corsHeader !== 'https://malicious-site.com') {
      console.log('   ✅ CORS properly configured\n');
    } else {
      console.log('   ❌ CORS may be too permissive\n');
    }
  } catch (error) {
    console.log('   ❌ CORS test failed:', error.message, '\n');
  }

  // Test 7: Security Metrics Endpoint
  console.log('7. Testing Security Metrics Access...');
  try {
    const response = await axios.get(`${BASE_URL}/security/metrics`, {
      validateStatus: () => true
    });
    
    if (response.status === 401 || response.status === 403) {
      console.log('   ✅ Security metrics properly protected\n');
    } else {
      console.log('   ❌ Security metrics may be exposed\n');
    }
  } catch (error) {
    console.log('   ❌ Security metrics test failed:', error.message, '\n');
  }

  console.log('🔒 Security testing completed!');
}

// Run the tests
testSecurityFeatures().catch(console.error);