// Script to check current webhook configuration
require('dotenv').config();

async function checkWebhookConfig() {
    try {
        console.log('🔍 Checking WhatsApp webhook configuration...');

        const whatsappBusinessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
        const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

        console.log('📋 Configuration:');
        console.log('- WABA ID:', whatsappBusinessAccountId);
        console.log('- Access Token:', accessToken ? 'Set' : 'Missing');

        if (!accessToken) {
            console.error('❌ Missing WHATSAPP_ACCESS_TOKEN in .env file');
            return;
        }

        // Check webhook subscriptions
        console.log('\n📡 Checking webhook subscriptions...');
        const response = await fetch(
            `https://graph.facebook.com/v23.0/${whatsappBusinessAccountId}/subscribed_apps`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            }
        );

        const result = await response.json();

        if (response.ok) {
            console.log('✅ Webhook subscriptions:', JSON.stringify(result, null, 2));

            if (result.data && result.data.length > 0) {
                for (const app of result.data) {
                    console.log(`\n📱 App: ${app.whatsapp_business_api_data.name} (${app.whatsapp_business_api_data.id})`);
                }
            } else {
                console.log('⚠️ No apps are subscribed to this WABA');
            }
        } else {
            console.error('❌ Error checking subscriptions:', result);
        }

        // Check phone number webhook configuration
        console.log('\n📞 Checking phone number webhook configuration...');
        const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

        if (phoneNumberId) {
            const phoneResponse = await fetch(
                `https://graph.facebook.com/v23.0/${phoneNumberId}?fields=webhook_configuration`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    },
                }
            );

            const phoneResult = await phoneResponse.json();

            if (phoneResponse.ok) {
                console.log('📞 Phone number webhook config:', JSON.stringify(phoneResult, null, 2));
            } else {
                console.error('❌ Error checking phone number config:', phoneResult);
            }
        }

    } catch (error) {
        console.error('❌ Error checking webhook configuration:', error);
    }
}

checkWebhookConfig();
