const API_BASE = 'http://localhost:4005';

async function testWithCookies() {
  console.log('=== Testing WhatsApp with Cookies ===\n');

  // Step 1: Login to get fresh cookies
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
    console.error('❌ Login failed:', loginResponse.status, await loginResponse.text());
    return;
  }

  console.log('✓ Login successful');
  
  // Extract cookies from response
  const setCookieHeader = loginResponse.headers.get('set-cookie');
  console.log('Set-Cookie header:', setCookieHeader);
  
  if (!setCookieHeader) {
    console.error('❌ No cookies received');
    return;
  }

  // Parse cookies to use in subsequent requests
  const cookies = setCookieHeader.split(', ').map(cookie => cookie.split(';')[0]).join('; ');
  console.log('✓ Cookies extracted:', cookies);

  // Step 2: Send WhatsApp hello_world template
  console.log('\n2. Sending WhatsApp hello_world template...');
  const sendResponse = await fetch(`${API_BASE}/api/communications/send-whatsapp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookies
    },
    body: JSON.stringify({
      candidateId: 'cmczzbfyz0004iut4igd2mkv4',
      content: 'Hello from Papaya Trading - this is the hello_world template',
      templateName: 'hello_world'
    })
  });

  if (sendResponse.ok) {
    const result = await sendResponse.json();
    console.log('✓ WhatsApp hello_world template sent successfully:', JSON.stringify(result, null, 2));
  } else {
    const errorText = await sendResponse.text();
    console.error('❌ Failed to send hello_world template:', sendResponse.status, errorText);
  }

  // Step 3: Send WhatsApp cv_received_notification template
  console.log('\n3. Sending WhatsApp cv_received_notification template...');
  const sendResponse2 = await fetch(`${API_BASE}/api/communications/send-whatsapp`, {
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

  if (sendResponse2.ok) {
    const result = await sendResponse2.json();
    console.log('✓ WhatsApp cv_received_notification template sent successfully:', JSON.stringify(result, null, 2));
  } else {
    const errorText = await sendResponse2.text();
    console.error('❌ Failed to send cv_received_notification template:', sendResponse2.status, errorText);
  }

  // Step 4: Get all communications
  console.log('\n4. Getting all communications...');
  const communicationsResponse = await fetch(`${API_BASE}/api/communications?limit=5`, {
    headers: {
      'Cookie': cookies
    }
  });

  if (communicationsResponse.ok) {
    const communications = await communicationsResponse.json();
    console.log('✓ Recent communications:', JSON.stringify(communications, null, 2));
  } else {
    console.error('❌ Failed to get communications:', communicationsResponse.status, await communicationsResponse.text());
  }
}

testWithCookies().catch(console.error);
