const API_BASE = 'http://localhost:4005';

async function testCVTemplate() {
  console.log('=== Testing CV Received Notification Template ===\n');

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

  const loginData = await loginResponse.json();
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

  // Step 2: Send CV notification template with proper parameters
  console.log('\n2. Sending CV notification template...');
  const sendResponse = await fetch(`${API_BASE}/api/communications/send-whatsapp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      candidateId: 'cmczzbfyz0004iut4igd2mkv4',
      content: 'CV received notification sent to candidate',
      templateName: 'cv_received_notification',
      templateParams: [
        'Strong Password User', // {{1}} - candidate name in body
        'https://meet.google.com/abc-defg-hij' // URL parameter for the button
      ]
    })
  });

  if (sendResponse.ok) {
    const result = await sendResponse.json();
    console.log('✓ CV notification template sent successfully:', JSON.stringify(result, null, 2));
  } else {
    const errorText = await sendResponse.text();
    console.error('Failed to send CV notification template:', sendResponse.status, errorText);
  }

  console.log('\n=== Test Complete ===');
}

testCVTemplate().catch(console.error);
