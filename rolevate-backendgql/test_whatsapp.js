const fetch = require('node-fetch');

async function testWhatsAppMessage() {
    const GRAPHQL_URL = 'http://localhost:4005/api/graphql';
    const SYSTEM_API_KEY = '31a29647809f2bf22295b854b30eafd58f50ea1559b0875ad2b55f508aa5215e';

    const query = `
        mutation SendWhatsAppTextMessage($input: SendTextMessageInput!) {
            sendWhatsAppTextMessage(input: $input) {
                messaging_product
                contacts {
                    input
                    wa_id
                }
                messages {
                    id
                }
            }
        }
    `;

    const variables = {
        input: {
            to: "962796026659",
            text: "Hello! This is a test message from RoleVate WhatsApp integration."
        }
    };

    try {
        console.log('Sending test WhatsApp message to 962796026659...');

        const response = await fetch(GRAPHQL_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SYSTEM_API_KEY}`,
            },
            body: JSON.stringify({
                query,
                variables
            })
        });

        const result = await response.json();

        if (response.ok && !result.errors) {
            console.log('✅ WhatsApp message sent successfully!');
            console.log('Response:', JSON.stringify(result.data, null, 2));
        } else {
            console.log('❌ Failed to send WhatsApp message');
            console.log('Status:', response.status);
            console.log('Response:', JSON.stringify(result, null, 2));
        }
    } catch (error) {
        console.error('❌ Error testing WhatsApp:', error.message);
    }
}

testWhatsAppMessage();