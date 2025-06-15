// Script to set up WhatsApp webhook subscription for messages
require('dotenv').config();

async function setupWebhookSubscription() {
    try {
        console.log('🔧 Setting up WhatsApp webhook subscription...');

        const appId = process.env.FACEBOOK_APP_ID;
        const appSecret = process.env.FACEBOOK_APP_SECRET;
        const whatsappBusinessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
        const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

        console.log('📋 Configuration:');
        console.log('- App ID:', appId);
        console.log('- WABA ID:', whatsappBusinessAccountId);
        console.log('- Access Token:', accessToken ? 'Set' : 'Missing');

        if (!accessToken) {
            console.error('❌ Missing WHATSAPP_ACCESS_TOKEN in .env file');
            return;
        }

        // Step 1: Subscribe the app to webhook events
        console.log('\n🔔 Step 1: Subscribing app to webhook events...');
        const appSubscriptionResponse = await fetch(
            `https://graph.facebook.com/v23.0/${appId}/subscriptions`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    object: 'whatsapp_business_account',
                    callback_url: 'https://rolevate.com/api/whatsapp/webhook',
                    verify_token: 'tt55oo77',
                    fields: 'messages,message_deliveries,message_reads,message_reactions,message_template_status_update'
                }),
            }
        );

        const appSubscriptionResult = await appSubscriptionResponse.json();

        if (appSubscriptionResponse.ok) {
            console.log('✅ App webhook subscription successful:', appSubscriptionResult);
        } else {
            console.log('⚠️ App webhook subscription response:', appSubscriptionResult);
        }

        // Step 2: Subscribe the WhatsApp Business Account to webhook events  
        console.log('\n🔔 Step 2: Subscribing WABA to webhook events...');
        const wabaSubscriptionResponse = await fetch(
            `https://graph.facebook.com/v23.0/${whatsappBusinessAccountId}/subscribed_apps`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const wabaSubscriptionResult = await wabaSubscriptionResponse.json();

        if (wabaSubscriptionResponse.ok) {
            console.log('✅ WABA webhook subscription successful:', wabaSubscriptionResult);
        } else {
            console.log('⚠️ WABA webhook subscription response:', wabaSubscriptionResult);
        }

        // Step 3: Check current webhook subscriptions
        console.log('\n📋 Step 3: Checking current webhook subscriptions...');
        const checkSubscriptionsResponse = await fetch(
            `https://graph.facebook.com/v23.0/${appId}/subscriptions`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            }
        );

        const subscriptions = await checkSubscriptionsResponse.json();
        console.log('📊 Current subscriptions:', JSON.stringify(subscriptions, null, 2));

        // Step 4: Check WABA subscribed apps
        console.log('\n📋 Step 4: Checking WABA subscribed apps...');
        const wabaAppsResponse = await fetch(
            `https://graph.facebook.com/v23.0/${whatsappBusinessAccountId}/subscribed_apps`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            }
        );

        const wabaApps = await wabaAppsResponse.json();
        console.log('📱 WABA subscribed apps:', JSON.stringify(wabaApps, null, 2));

        console.log('\n✅ Webhook subscription setup complete!');
        console.log('🔄 Now try sending a message to your WhatsApp Business number to test webhook delivery.');

    } catch (error) {
        console.error('❌ Error setting up webhook subscription:', error);
    }
}

setupWebhookSubscription();
