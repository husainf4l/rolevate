const API_BASE = 'http://localhost:4005';

async function testSingleTemplate() {
  console.log('=== Testing Single Template ===\n');

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
    console.error('❌ Login failed:', loginResponse.status);
    return;
  }

  const setCookieHeader = loginResponse.headers.get('set-cookie');
  const cookies = setCookieHeader.split(', ').map(cookie => cookie.split(';')[0]).join('; ');
  console.log('✓ Login successful');

  // Step 2: Test cv_received_notification template with parameters
  console.log('\n2. Testing cv_received_notification template...');
  const response = await fetch(`${API_BASE}/api/communications/send-whatsapp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookies
    },
    body: JSON.stringify({
      candidateId: 'cmczzbfyz0004iut4igd2mkv4',
      content: 'CV received notification for Strong Password User',
      templateName: 'cv_received_notification',
      templateParams: ['Strong Password User']
    })
  });

  console.log('Response status:', response.status);
  
  if (response.ok) {
    const result = await response.json();
    console.log('✓ Success:', JSON.stringify(result, null, 2));
  } else {
    const errorText = await response.text();
    console.error('❌ Error:', errorText);
  }
}

testSingleTemplate().catch(console.error);
