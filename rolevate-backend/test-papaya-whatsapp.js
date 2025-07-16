#!/usr/bin/env node

/**
 * Test script to send WhatsApp message for Papaya Trading
 * This will test the communication system with real data
 */

// Use built-in fetch (Node.js 18+)
// const fetch = require('node-fetch');

const baseUrl = 'http://localhost:4005';

// Papaya Trading credentials
const credentials = {
  email: 'al-hussein@papayatrading.com',
  password: 'tt55oo77'
};

let authToken = null;

async function login() {
  console.log('� Logging in to Papaya Trading...');
  
  const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });

  if (!loginResponse.ok) {
    throw new Error(`Login failed: ${loginResponse.status}`);
  }

  const loginData = await loginResponse.json();
  authToken = loginData.access_token;
  
  console.log('✅ Login successful!');
  console.log('Company:', loginData.user?.company?.name || 'Papaya Trading');
  
  return authToken;
}

async function testSendWhatsAppMessage() {
  console.log('🚀 Testing WhatsApp Communication for Papaya Trading...\n');

  try {
    // Login first
    await login();
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    };

    // Get candidates to find one with a phone number
    console.log('\n1. Finding candidates with phone numbers...');
    
    // Test authentication with stats endpoint
    const statsResponse = await fetch(`${baseUrl}/api/communications/stats`, { headers });
    if (!statsResponse.ok) {
      throw new Error(`Stats endpoint failed: ${statsResponse.status}`);
    }
    
    console.log('✅ Authentication successful!');
    
    // Test sending a WhatsApp message to a candidate with phone number
    console.log('\n2. Testing send WhatsApp message...');
    
    // Find a candidate with phone number - you mentioned you updated them
    const testMessage = {
      candidateId: 'cmcyx6dvw00003s3t4jmo91qx', // Update this with a real candidate ID that has phone number
      content: 'Hello from Papaya Trading! 🚀 Thank you for your interest in our job opportunity. We will review your application and get back to you soon. This is a test message from our new communication system.'
    };
    
    console.log('📱 Sending WhatsApp message...');
    console.log('Message:', testMessage.content);
    console.log('To candidate ID:', testMessage.candidateId);
    
    const sendResponse = await fetch(`${baseUrl}/api/communications/send-whatsapp`, {
      method: 'POST',
      headers,
      body: JSON.stringify(testMessage)
    });
    
    const sendResult = await sendResponse.json();
    
    if (sendResponse.ok) {
      console.log('\n✅ WhatsApp message sent successfully!');
      console.log('Communication ID:', sendResult.communication?.id);
      console.log('WhatsApp Message ID:', sendResult.whatsappResult?.messages?.[0]?.id);
      console.log('Status:', sendResult.communication?.status);
      console.log('Phone number:', sendResult.communication?.phoneNumber);
    } else {
      console.log('\n❌ Failed to send message:');
      console.log('Status:', sendResponse.status);
      console.log('Error:', sendResult);
    }
    
    // Get communication history for this candidate
    console.log('\n3. Getting communication history...');
    const historyResponse = await fetch(`${baseUrl}/api/communications/history/${testMessage.candidateId}`, { headers });
    const historyData = await historyResponse.json();
    
    if (historyResponse.ok) {
      console.log(`✅ Found ${historyData.length} communications for this candidate:`);
      historyData.forEach((comm, index) => {
        console.log(`  ${index + 1}. ${comm.type} - ${comm.direction} - ${comm.status}`);
        console.log(`     "${comm.content.substring(0, 50)}..."`);
        console.log(`     Sent: ${new Date(comm.sentAt).toLocaleString()}`);
      });
    }

    // Get updated communication stats
    console.log('\n4. Getting updated communication stats...');
    const stats = await fetch(`${baseUrl}/api/communications/stats`, { headers });
    const statsData = await stats.json();
    console.log('📊 Communication stats:', statsData);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the test
console.log('� Starting Papaya Trading WhatsApp Communication Test\n');
testSendWhatsAppMessage();
