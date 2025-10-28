const fetch = require('node-fetch');

async function testCVReceivedTemplate() {
    const GRAPHQL_URL = 'http://localhost:4005/api/graphql';
    const SYSTEM_API_KEY = '31a29647809f2bf22295b854b30eafd58f50ea1559b0875ad2b55f508aa5215e';

    const query = `
        mutation SendWhatsAppTemplateMessage($input: SendTemplateMessageInput!) {
            sendWhatsAppTemplateMessage(input: $input) {
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
            templateName: "cv_received_notification",
            language: "EN"
        }
    };

    try {
        console.log('Sending CV received notification template to 962796026659...');

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
            console.log('✅ CV received notification template sent successfully!');
            console.log('Response:', JSON.stringify(result.data, null, 2));
        } else {
            console.log('❌ Failed to send CV received notification template');
            console.log('Status:', response.status);
            console.log('Response:', JSON.stringify(result, null, 2));
        }
    } catch (error) {
        console.error('❌ Error testing CV template:', error.message);
    }
}

testCVReceivedTemplate();