const API_BASE = 'http://localhost:4005';

async function testWhatsAppCommunication() {
  console.log('=== Testing WhatsApp Communication System ===\n');

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
  console.log('Cookies received:', cookies);
  
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

  // Step 2: Get communication stats
  console.log('\n2. Getting communication stats...');
  const statsResponse = await fetch(`${API_BASE}/api/communications/stats`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (statsResponse.ok) {
    const stats = await statsResponse.json();
    console.log('✓ Communication stats:', JSON.stringify(stats, null, 2));
  } else {
    console.error('Failed to get stats:', statsResponse.status, await statsResponse.text());
  }

  // Step 3: Get all communications
  console.log('\n3. Getting all communications...');
  const communicationsResponse = await fetch(`${API_BASE}/api/communications?limit=10`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (communicationsResponse.ok) {
    const communications = await communicationsResponse.json();
    console.log('✓ Communications:', JSON.stringify(communications, null, 2));
  } else {
    console.error('Failed to get communications:', communicationsResponse.status, await communicationsResponse.text());
  }

  // Step 4: Send WhatsApp template message
  console.log('\n4. Sending WhatsApp template message...');
  const sendResponse = await fetch(`${API_BASE}/api/communications/send-whatsapp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      candidateId: 'cmczzbfyz0004iut4igd2mkv4',
      content: 'Hello from Papaya Trading - this is the hello_world template',
      templateName: 'hello_world'
      // Removed templateParams since hello_world doesn't need any parameters
    })
  });

  if (sendResponse.ok) {
    const result = await sendResponse.json();
    console.log('✓ WhatsApp message sent successfully:', JSON.stringify(result, null, 2));
  } else {
    const errorText = await sendResponse.text();
    console.error('Failed to send WhatsApp message:', sendResponse.status, errorText);
  }

  // Step 5: Get updated communications after sending
  console.log('\n5. Getting updated communications...');
  const updatedResponse = await fetch(`${API_BASE}/api/communications?limit=10`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (updatedResponse.ok) {
    const updated = await updatedResponse.json();
    console.log('✓ Updated communications:', JSON.stringify(updated, null, 2));
  } else {
    console.error('Failed to get updated communications:', updatedResponse.status, await updatedResponse.text());
  }

  console.log('\n=== Test Complete ===');
}

testWhatsAppCommunication().catch(console.error);
