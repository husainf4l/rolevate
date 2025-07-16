#!/usr/bin/env node

/**
 * Simple test for Papaya Trading WhatsApp Communication
 */

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFsLWh1c3NlaW5AcGFwYXlhdHJhZGluZy5jb20iLCJzdWIiOiJjbWN2d2tiMGUwMDA0aXVid2kzeHBiYWtnIiwidXNlclR5cGUiOiJDT01QQU5ZIiwiaWF0IjoxNzUyNjI5NTAwLCJleHAiOjE3NTI2MzA0MDB9.NpPxjwfG9nb93nTlviX0BevaCRAOkaBXOqdLvyhMyr4';
const BASE_URL = 'http://localhost:4005';
const CANDIDATE_ID = 'cmcyx6dvw00003s3t4jmo91qx'; // Candidate with phone 962796026659

async function testPapayaWhatsApp() {
  console.log('🌟 Testing Papaya Trading WhatsApp Communication System...\n');

  try {
    // Test 1: Check authentication with stats endpoint
    console.log('1. Testing authentication...');
    const statsResponse = await fetch(`${BASE_URL}/api/communications/stats`, {
      headers: { 'Authorization': `Bearer ${TOKEN}` }
    });
    
    if (statsResponse.ok) {
      const stats = await statsResponse.json();
      console.log('✅ Authentication successful!');
      console.log('📊 Current stats:', JSON.stringify(stats, null, 2));
    } else {
      console.log('❌ Authentication failed:', statsResponse.status);
      return;
    }

    // Test 2: Send WhatsApp message
    console.log('\n2. Sending WhatsApp message to candidate...');
    const message = {
      candidateId: CANDIDATE_ID,
      content: '🌟 Hello from Papaya Trading! Thank you for your interest in our healthcare opportunities. We have received your application and will review it shortly. We look forward to potentially welcoming you to our innovative team! 🏥💼'
    };

    const sendResponse = await fetch(`${BASE_URL}/api/communications/send-whatsapp`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    });

    const sendResult = await sendResponse.json();
    
    if (sendResponse.ok) {
      console.log('✅ WhatsApp message sent successfully!');
      console.log('📱 Communication ID:', sendResult.communication?.id);
      console.log('📤 WhatsApp Message ID:', sendResult.whatsappResult?.messages?.[0]?.id || 'Generated mock ID');
      console.log('📞 Phone Number:', sendResult.communication?.phoneNumber);
    } else {
      console.log('❌ Failed to send WhatsApp message:');
      console.log('Status:', sendResponse.status);
      console.log('Error:', JSON.stringify(sendResult, null, 2));
    }

    // Test 3: Get communication history
    console.log('\n3. Getting communication history for candidate...');
    const historyResponse = await fetch(`${BASE_URL}/api/communications/history/${CANDIDATE_ID}`, {
      headers: { 'Authorization': `Bearer ${TOKEN}` }
    });

    if (historyResponse.ok) {
      const history = await historyResponse.json();
      console.log('✅ Communication history retrieved!');
      console.log(`📋 Total communications: ${history.length}`);
      
      if (history.length > 0) {
        console.log('\n📝 Recent communications:');
        history.slice(-3).forEach((comm, index) => {
          console.log(`${index + 1}. [${comm.type}] ${comm.direction} - ${comm.status}`);
          console.log(`   Content: ${comm.content.substring(0, 100)}...`);
          console.log(`   Sent: ${new Date(comm.sentAt).toLocaleString()}`);
        });
      }
    } else {
      console.log('❌ Failed to get history:', historyResponse.status);
    }

    // Test 4: Get updated stats
    console.log('\n4. Getting updated communication stats...');
    const finalStatsResponse = await fetch(`${BASE_URL}/api/communications/stats`, {
      headers: { 'Authorization': `Bearer ${TOKEN}` }
    });

    if (finalStatsResponse.ok) {
      const finalStats = await finalStatsResponse.json();
      console.log('✅ Updated stats retrieved!');
      console.log('📊 Final stats:', JSON.stringify(finalStats, null, 2));
    }

    console.log('\n🎉 Papaya Trading WhatsApp Communication test completed successfully!');

  } catch (error) {
    console.error('❌ Error during test:', error.message);
  }
}

testPapayaWhatsApp();
