// Script to manage WABA app subscriptions
require('dotenv').config();

async function manageSubscriptions() {
    try {
        console.log('🔧 Managing WABA app subscriptions...');

        const whatsappBusinessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
        const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
        const ourAppId = process.env.FACEBOOK_APP_ID; // 715676624268824

        console.log('📋 Configuration:');
        console.log('- WABA ID:', whatsappBusinessAccountId);
        console.log('- Our App ID:', ourAppId);

        // Check current subscriptions first
        console.log('\n📡 Current subscriptions:');
        const listResponse = await fetch(
            `https://graph.facebook.com/v23.0/${whatsappBusinessAccountId}/subscribed_apps`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            }
        );

        const listResult = await listResponse.json();

        if (listResponse.ok) {
            console.log('Current apps:', JSON.stringify(listResult, null, 2));

            // Remove the "widdai" app (1121074976519855) if it exists
            const widdaiAppId = '1121074976519855';
            const hasWiddai = listResult.data?.some(app =>
                app.whatsapp_business_api_data.id === widdaiAppId
            );

            if (hasWiddai) {
                console.log('\n🗑️ Removing "widdai" app subscription...');
                const removeResponse = await fetch(
                    `https://graph.facebook.com/v23.0/${whatsappBusinessAccountId}/subscribed_apps`,
                    {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            subscribed_apps: [widdaiAppId]
                        })
                    }
                );

                const removeResult = await removeResponse.json();

                if (removeResponse.ok) {
                    console.log('✅ Widdai app removed successfully:', removeResult);
                } else {
                    console.log('❌ Failed to remove widdai app:', removeResult);
                }
            } else {
                console.log('ℹ️ Widdai app not found in subscriptions');
            }

            // Ensure our app is subscribed
            console.log('\n✅ Ensuring our app is subscribed...');
            const subscribeResponse = await fetch(
                `https://graph.facebook.com/v23.0/${whatsappBusinessAccountId}/subscribed_apps`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        subscribed_apps: [ourAppId]
                    })
                }
            );

            const subscribeResult = await subscribeResponse.json();

            if (subscribeResponse.ok) {
                console.log('✅ Our app subscription confirmed:', subscribeResult);
            } else {
                console.log('⚠️ App subscription result:', subscribeResult);
            }

        } else {
            console.error('❌ Error listing subscriptions:', listResult);
        }

        // Final check
        console.log('\n📡 Final subscription check:');
        const finalResponse = await fetch(
            `https://graph.facebook.com/v23.0/${whatsappBusinessAccountId}/subscribed_apps`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            }
        );

        const finalResult = await finalResponse.json();
        console.log('Final subscriptions:', JSON.stringify(finalResult, null, 2));

    } catch (error) {
        console.error('❌ Error managing subscriptions:', error);
    }
}

manageSubscriptions();
