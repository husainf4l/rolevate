const fetch = require('node-fetch');

async function listWhatsAppTemplates() {
    const GRAPHQL_URL = 'http://localhost:4005/api/graphql';
    const SYSTEM_API_KEY = '31a29647809f2bf22295b854b30eafd58f50ea1559b0875ad2b55f508aa5215e';

    const query = `
        query ListWhatsAppTemplates {
            listWhatsAppTemplates {
                data {
                    name
                    status
                    languages
                    category
                }
            }
        }
    `;

    try {
        console.log('Fetching WhatsApp message templates...');

        const response = await fetch(GRAPHQL_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SYSTEM_API_KEY}`,
            },
            body: JSON.stringify({
                query
            })
        });

        const result = await response.json();

        if (response.ok && !result.errors) {
            console.log('✅ WhatsApp templates retrieved successfully!');
            console.log('Available templates:');
            result.data.listWhatsAppTemplates.data.forEach(template => {
                console.log(`- ${template.name} (${template.status}) [${template.languages?.join(', ')}] - ${template.category}`);
            });
        } else {
            console.log('❌ Failed to retrieve WhatsApp templates');
            console.log('Status:', response.status);
            console.log('Response:', JSON.stringify(result, null, 2));
        }
    } catch (error) {
        console.error('❌ Error fetching WhatsApp templates:', error.message);
    }
}

listWhatsAppTemplates();