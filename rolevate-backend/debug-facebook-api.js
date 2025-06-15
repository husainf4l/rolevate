// Quick script to debug Facebook API credentials
require('dotenv').config();

async function testFacebookCredentials() {
    const appId = process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;
    const systemUserId = process.env.FACEBOOK_SYSTEM_USER_ID;
    const staticToken = process.env.WHATSAPP_ACCESS_TOKEN;

    console.log('Testing Facebook API credentials...');
    console.log('App ID:', appId);
    console.log('System User ID:', systemUserId);
    console.log('App Secret:', appSecret ? 'Set' : 'Missing');
    console.log('Static Token:', staticToken ? 'Set (length: ' + staticToken.length + ')' : 'Missing');

    try {
        // Test static token first if available
        if (staticToken) {
            console.log('\n--- Testing Static Token ---');
            const staticTokenResponse = await fetch(
                `https://graph.facebook.com/v23.0/me?access_token=${staticToken}`
            );

            if (staticTokenResponse.ok) {
                const staticData = await staticTokenResponse.json();
                console.log('Static token is valid:', staticData);

                // Test WhatsApp API access
                console.log('\n--- Testing WhatsApp API Access ---');
                const wabaId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
                const wabaResponse = await fetch(
                    `https://graph.facebook.com/v23.0/${wabaId}?access_token=${staticToken}`
                );

                if (wabaResponse.ok) {
                    const wabaData = await wabaResponse.json();
                    console.log('WhatsApp Business Account accessible:', wabaData.name || 'Success');
                } else {
                    console.error('WhatsApp Business Account access failed:', wabaResponse.status);
                    const errorText = await wabaResponse.text();
                    console.error('Error details:', errorText);
                }
                return;
            } else {
                console.error('Static token is invalid:', staticTokenResponse.status);
                const errorText = await staticTokenResponse.text();
                console.error('Error details:', errorText);
            }
        }

        // Test 1: Get app access token
        console.log('\n--- Testing App Access Token ---');
        const appTokenResponse = await fetch(
            `https://graph.facebook.com/v23.0/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&grant_type=client_credentials`
        );

        if (!appTokenResponse.ok) {
            console.error('App token failed:', appTokenResponse.status, appTokenResponse.statusText);
            const errorText = await appTokenResponse.text();
            console.error('Error details:', errorText);
            return;
        }

        const appTokenData = await appTokenResponse.json();
        console.log('App access token obtained successfully');

        // Test 2: Get system user token
        console.log('\n--- Testing System User Token ---');
        const systemTokenResponse = await fetch(
            `https://graph.facebook.com/v23.0/${systemUserId}/access_tokens`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${appTokenData.access_token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    scope: 'whatsapp_business_messaging,whatsapp_business_management'
                })
            }
        );

        if (!systemTokenResponse.ok) {
            console.error('System user token failed:', systemTokenResponse.status, systemTokenResponse.statusText);
            const errorText = await systemTokenResponse.text();
            console.error('Error details:', errorText);
            return;
        }

        const systemTokenData = await systemTokenResponse.json();
        console.log('System user token obtained successfully');
        console.log('Token starts with:', systemTokenData.access_token.substring(0, 20) + '...');

    } catch (error) {
        console.error('Error during testing:', error);
    }
}

testFacebookCredentials();
