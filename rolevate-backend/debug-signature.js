// Debug signature verification
require('dotenv').config();
const crypto = require('crypto');

function testSignature() {
    // Sample webhook data from your logs
    const webhookBody = {
        "object": "whatsapp_business_account",
        "entry": [
            {
                "id": "1068830495102485",
                "changes": [
                    {
                        "value": {
                            "messaging_product": "whatsapp",
                            "metadata": {
                                "display_phone_number": "962791102555",
                                "phone_number_id": "684085261451106"
                            },
                            "contacts": [
                                {
                                    "profile": {
                                        "name": "Al-huusein Abdullah"
                                    },
                                    "wa_id": "962796026659"
                                }
                            ],
                            "messages": [
                                {
                                    "from": "962796026659",
                                    "id": "wamid.HBgMOTYyNzk2MDI2NjU5FQIAEhgUM0FGRjQ5RjNDNjZCM0FCMEZEMTUA",
                                    "timestamp": "1749928696",
                                    "text": {
                                        "body": "Hello"
                                    },
                                    "type": "text"
                                }
                            ]
                        },
                        "field": "messages"
                    }
                ]
            }
        ]
    };

    const receivedSignature = 'sha256=6766595393e46b3d2d754f8a5668cc0df83f6f0e20726d5587c0f23c9d66683d';
    const appSecret = process.env.WHATSAPP_APP_SECRET;

    console.log('🔍 Debugging signature verification...');
    console.log('📋 App Secret:', appSecret);
    console.log('📋 Received Signature:', receivedSignature);

    // Test different payload formats
    const payloadString1 = JSON.stringify(webhookBody);
    const payloadString2 = JSON.stringify(webhookBody, null, 0);

    console.log('\n🧪 Test 1: Standard JSON.stringify');
    const expectedSignature1 = 'sha256=' + crypto
        .createHmac('sha256', appSecret)
        .update(payloadString1, 'utf8')
        .digest('hex');
    console.log('Expected:', expectedSignature1);
    console.log('Match:', receivedSignature === expectedSignature1);

    console.log('\n🧪 Test 2: JSON.stringify with no spaces');
    const expectedSignature2 = 'sha256=' + crypto
        .createHmac('sha256', appSecret)
        .update(payloadString2, 'utf8')
        .digest('hex');
    console.log('Expected:', expectedSignature2);
    console.log('Match:', receivedSignature === expectedSignature2);

    console.log('\n🧪 Test 3: Raw payload bytes (what the server might receive)');
    // This simulates what NestJS might be passing to the verifySignature function
    console.log('Payload length (string 1):', payloadString1.length);
    console.log('Payload length (string 2):', payloadString2.length);
}

testSignature();
