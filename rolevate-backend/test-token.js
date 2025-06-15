require('dotenv').config();

async function testStaticToken() {
    const staticToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const wabaId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;

    console.log('Testing static WhatsApp token...');
    console.log('Token length:', staticToken ? staticToken.length : 'Missing');
    console.log('WABA ID:', wabaId);

    if (!staticToken) {
        console.error('No static token found');
        return;
    }

    try {
        // Test token validity
        console.log('\nTesting token validity...');
        const response = await fetch(
            `https://graph.facebook.com/v23.0/${wabaId}?access_token=${staticToken}`
        );

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Token is valid! WABA Name:', data.name);
            console.log('✅ WhatsApp Business Account accessible');
        } else {
            console.error('❌ Token test failed:', response.status, response.statusText);
            const errorText = await response.text();
            console.error('Error details:', errorText);
        }
    } catch (error) {
        console.error('❌ Error testing token:', error.message);
    }
}

testStaticToken().catch(console.error);
