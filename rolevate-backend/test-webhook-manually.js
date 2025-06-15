// Manual webhook test to simulate WhatsApp sending a message
require('dotenv').config();

async function sendTestWebhook() {
    try {
        console.log('🧪 Sending test webhook to your server...');

        // Create a realistic WhatsApp webhook payload
        const webhookPayload = {
            object: 'whatsapp_business_account',
            entry: [
                {
                    id: '1068830495102485',
                    changes: [
                        {
                            value: {
                                messaging_product: 'whatsapp',
                                metadata: {
                                    display_phone_number: '+962 7 9110 2555',
                                    phone_number_id: '684085261451106'
                                },
                                contacts: [
                                    {
                                        profile: {
                                            name: 'Test User'
                                        },
                                        wa_id: '962796026659'
                                    }
                                ],
                                messages: [
                                    {
                                        from: '962796026659',
                                        id: 'wamid.HBgMOTYyNzk2MDI2NjU5FQIAERgSRjg4QTJBNjZGNTQxODJDQThDAA==',
                                        timestamp: Math.floor(Date.now() / 1000).toString(),
                                        text: {
                                            body: 'Hello from manual test!'
                                        },
                                        type: 'text'
                                    }
                                ]
                            },
                            field: 'messages'
                        }
                    ]
                }
            ]
        };

        // Calculate proper signature
        const crypto = require('crypto');
        const appSecret = process.env.WHATSAPP_APP_SECRET;
        const payloadString = JSON.stringify(webhookPayload);
        const signature = 'sha256=' + crypto
            .createHmac('sha256', appSecret)
            .update(payloadString, 'utf8')
            .digest('hex');

        console.log('📋 Payload:', JSON.stringify(webhookPayload, null, 2));
        console.log('🔐 Signature:', signature);

        // Send to your webhook
        const response = await fetch('https://rolevate.com/api/whatsapp/webhook', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-hub-signature-256': signature,
                'User-Agent': 'facebookexternalua'
            },
            body: payloadString
        });

        const result = await response.text();
        console.log('\n📡 Response Status:', response.status);
        console.log('📡 Response Body:', result);

        if (response.status === 200 && result === 'OK') {
            console.log('✅ Test webhook delivered successfully!');
            console.log('🔍 Check your console logs for the webhook processing messages.');
        } else {
            console.log('❌ Test webhook failed');
        }

    } catch (error) {
        console.error('❌ Error sending test webhook:', error);
    }
}

sendTestWebhook();
