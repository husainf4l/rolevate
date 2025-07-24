#!/usr/bin/env node

/**
 * Debug script to test communication saving
 */

const API_BASE = 'https://rolevate.com/api';

async function debugCommunicationSave() {
    console.log('🔍 Debugging Communication Save Issue...\n');

    try {
        // Step 1: Login
        console.log('1. Logging in...');
        const loginResponse = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'al-hussein@papayatrading.com',
                password: 'tt55oo77'
            })
        });

        if (!loginResponse.ok) {
            throw new Error(`Login failed: ${loginResponse.status}`);
        }

        // Extract token from cookies
        const cookies = loginResponse.headers.get('set-cookie');
        const tokenMatch = cookies?.match(/access_token=([^;]+)/);
        const accessToken = tokenMatch?.[1];

        if (!accessToken) {
            throw new Error('No access token found');
        }

        console.log('✅ Login successful');

        // Step 2: Check current communications
        console.log('\n2. Checking current communications...');
        const commsResponse = await fetch(`${API_BASE}/communications?limit=5`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        if (commsResponse.ok) {
            const comms = await commsResponse.json();
            console.log(`📊 Current communications count: ${comms.length}`);
            comms.forEach((comm, i) => {
                console.log(`   ${i + 1}. ${comm.type} to ${comm.candidate?.firstName} ${comm.candidate?.lastName} - ${comm.status}`);
            });
        } else {
            console.log('❌ Failed to get communications:', commsResponse.status);
        }

        // Step 3: Send a test WhatsApp message
        console.log('\n3. Sending test WhatsApp message...');
        const testMessage = {
            candidateId: 'cmczzbfyz0004iut4igd2mkv4', // Update with valid candidate ID
            content: 'Test message to debug communication saving',
            templateName: 'hello_world'
        };

        const sendResponse = await fetch(`${API_BASE}/communications/send-whatsapp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(testMessage)
        });

        const sendResult = await sendResponse.json();

        if (sendResponse.ok) {
            console.log('✅ WhatsApp message sent successfully!');
            console.log('📱 Communication ID:', sendResult.communication?.id);
            console.log('📤 WhatsApp Message ID:', sendResult.whatsappResult?.messages?.[0]?.id);
            console.log('📞 Phone Number:', sendResult.communication?.phoneNumber);
        } else {
            console.log('❌ Failed to send WhatsApp message:');
            console.log('Status:', sendResponse.status);
            console.log('Error:', JSON.stringify(sendResult, null, 2));
        }

        // Step 4: Check communications again to see if it was saved
        console.log('\n4. Checking communications after sending...');
        const commsAfterResponse = await fetch(`${API_BASE}/communications?limit=5`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        if (commsAfterResponse.ok) {
            const commsAfter = await commsAfterResponse.json();
            console.log(`📊 Communications count after sending: ${commsAfter.length}`);
            console.log('📋 Recent communications:');
            commsAfter.slice(0, 3).forEach((comm, i) => {
                console.log(`   ${i + 1}. ${comm.type} to ${comm.candidate?.firstName} ${comm.candidate?.lastName} - ${comm.status}`);
                console.log(`      Content: "${comm.content.substring(0, 50)}..."`);
                console.log(`      Sent: ${new Date(comm.sentAt).toLocaleString()}`);
                console.log('');
            });
        }

        // Step 5: Check candidate-specific history
        console.log('\n5. Checking candidate-specific history...');
        const historyResponse = await fetch(`${API_BASE}/communications/history/${testMessage.candidateId}`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        if (historyResponse.ok) {
            const history = await historyResponse.json();
            console.log(`📋 Candidate history count: ${history.length}`);
            if (history.length > 0) {
                console.log('Recent messages for this candidate:');
                history.slice(-3).forEach((comm, i) => {
                    console.log(`   ${i + 1}. [${comm.type}] ${comm.direction} - ${comm.status}`);
                    console.log(`      "${comm.content.substring(0, 50)}..."`);
                    console.log(`      Sent: ${new Date(comm.sentAt).toLocaleString()}`);
                });
            }
        } else {
            console.log('❌ Failed to get candidate history:', historyResponse.status);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.stack) {
            console.error('Stack:', error.stack);
        }
    }
}

debugCommunicationSave();
