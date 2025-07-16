const API_BASE = 'http://localhost:4005';

async function testWithDirectToken() {
  console.log('=== Testing WhatsApp with direct cookie token ===\n');

  // Use the token we saw in the server logs
  const accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFsLWh1c3NlaW5AcGFwYXlhdHJhZGluZy5jb20iLCJzdWIiOiJjbWN2d2tiMGUwMDA0aXVid2kzeHBiYWtnIiwidXNlclR5cGUiOiJDT01QQU5ZIiwiaWF0IjoxNzUyNjMwNTAzLCJleHAiOjE3NTI2MzE0MDN9.GUsAgvbvpOeW7i5H_AUZL9wUpAj3zhMbn56Wblo-Eqw';

  // Step 1: Send WhatsApp template message (hello_world template)
  console.log('1. Sending WhatsApp hello_world template...');
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
      // No templateParams for hello_world template
    })
  });

  if (sendResponse.ok) {
    const result = await sendResponse.json();
    console.log('✓ WhatsApp hello_world template sent successfully:', JSON.stringify(result, null, 2));
  } else {
    const errorText = await sendResponse.text();
    console.error('❌ Failed to send hello_world template:', sendResponse.status, errorText);
  }

  // Step 2: Send WhatsApp template message with parameters (cv_received_notification)
  console.log('\n2. Sending WhatsApp cv_received_notification template...');
  const sendResponse2 = await fetch(`${API_BASE}/api/communications/send-whatsapp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      candidateId: 'cmczzbfyz0004iut4igd2mkv4',
      content: 'CV received notification for Strong Password User',
      templateName: 'cv_received_notification',
      templateParams: ['Strong Password User'] // This template needs a parameter
    })
  });

  if (sendResponse2.ok) {
    const result = await sendResponse2.json();
    console.log('✓ WhatsApp cv_received_notification template sent successfully:', JSON.stringify(result, null, 2));
  } else {
    const errorText = await sendResponse2.text();
    console.error('❌ Failed to send cv_received_notification template:', sendResponse2.status, errorText);
  }

  // Step 3: Get all communications to see results
  console.log('\n3. Getting all communications...');
  const communicationsResponse = await fetch(`${API_BASE}/api/communications?limit=5`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (communicationsResponse.ok) {
    const communications = await communicationsResponse.json();
    console.log('✓ Recent communications:', JSON.stringify(communications, null, 2));
  } else {
    console.error('❌ Failed to get communications:', communicationsResponse.status, await communicationsResponse.text());
  }
}

testWithDirectToken().catch(console.error);
