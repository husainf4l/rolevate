// Script to test webhook delivery manually
require('dotenv').config();

async function testWebhookDelivery() {
    try {
        console.log('🧪 Testing webhook delivery...');

        // Test 1: Simple webhook verification test
        console.log('\n📡 Test 1: Webhook verification test');
        const verifyResponse = await fetch(
            'https://rolevate.com/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=tt55oo77&hub.challenge=test123'
        );

        const verifyResult = await verifyResponse.text();
        console.log('Verification response:', verifyResult);

        if (verifyResult === 'test123') {
            console.log('✅ Webhook verification is working');
        } else {
            console.log('❌ Webhook verification failed');
        }

        // Test 2: Test POST webhook endpoint
        console.log('\n📡 Test 2: POST webhook test');
        const postResponse = await fetch(
            'https://rolevate.com/api/whatsapp/webhook',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-hub-signature-256': 'sha256=invalid_signature_for_test',
                },
                body: JSON.stringify({
                    object: 'whatsapp_business_account',
                    entry: [{
                        id: 'test',
                        changes: [{
                            value: {
                                messages: [{
                                    id: 'test_message_id',
                                    from: '962796026659',
                                    timestamp: Math.floor(Date.now() / 1000).toString(),
                                    type: 'text',
                                    text: {
                                        body: 'Test webhook message'
                                    }
                                }],
                                contacts: [{
                                    profile: {
                                        name: 'Test User'
                                    },
                                    wa_id: '962796026659'
                                }]
                            },
                            field: 'messages'
                        }]
                    }]
                })
            }
        );

        const postResult = await postResponse.text();
        console.log('POST response status:', postResponse.status);
        console.log('POST response:', postResult);

        // Test 3: Check if webhook URL is reachable
        console.log('\n📡 Test 3: Basic connectivity test');
        const connectivityResponse = await fetch('https://rolevate.com/api/whatsapp/test-connection');
        const connectivityResult = await connectivityResponse.json();
        console.log('API connectivity:', connectivityResult.success ? '✅ Working' : '❌ Failed');

    } catch (error) {
        console.error('❌ Error testing webhook:', error);
    }
}

testWebhookDelivery();
