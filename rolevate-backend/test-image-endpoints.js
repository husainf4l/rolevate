const API_BASE = 'http://localhost:4005';

async function testImageEndpoints() {
  console.log('=== Testing Image Upload and Retrieval ===\n');

  // Step 1: Login
  console.log('1. Logging in...');
  const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'al-hussein@papayatrading.com',
      password: 'tt55oo77'
    })
  });

  if (!loginResponse.ok) {
    console.error('Login failed:', loginResponse.status);
    return;
  }

  console.log('✓ Login successful');
  
  // Extract token from Set-Cookie header
  const cookies = loginResponse.headers.get('set-cookie');
  let accessToken = null;
  if (cookies) {
    const tokenMatch = cookies.match(/access_token=([^;]+)/);
    if (tokenMatch) {
      accessToken = tokenMatch[1];
      console.log('✓ Token extracted from cookie');
    }
  }
  
  if (!accessToken) {
    console.error('❌ No access token found in response');
    return;
  }

  // Step 2: Test /me endpoint to see current user data
  console.log('\n2. Testing /me endpoint...');
  const meResponse = await fetch(`${API_BASE}/api/auth/me`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (meResponse.ok) {
    const userData = await meResponse.json();
    console.log('✓ User data:', JSON.stringify(userData, null, 2));
    console.log('Avatar field:', userData.avatar);
  } else {
    console.error('Failed to get user data:', meResponse.status, await meResponse.text());
  }

  // Step 3: Test company profile endpoint to see company logo
  console.log('\n3. Testing company profile endpoint...');
  const companyResponse = await fetch(`${API_BASE}/api/company/profile`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (companyResponse.ok) {
    const companyData = await companyResponse.json();
    console.log('✓ Company data:', JSON.stringify(companyData, null, 2));
    console.log('Logo field:', companyData.logo);
  } else {
    console.error('Failed to get company data:', companyResponse.status, await companyResponse.text());
  }

  console.log('\n=== Test Complete ===');
}

testImageEndpoints().catch(console.error);
