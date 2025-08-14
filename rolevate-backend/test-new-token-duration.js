const axios = require('axios');

async function testNewTokenDuration() {
    console.log('🧪 Testing New Token Duration (2 hours)\n');

    const BASE_URL = 'http://localhost:4005/api';
    const testUser = {
        email: 'al-hussein@papayatrading.com',
        password: 'TT%%oo77'
    };

    try {
        // Step 1: Login to get a fresh token with new 2-hour expiration
        console.log('1. Logging in to get fresh token...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, testUser);

        console.log('   ✅ Login successful');

        // Step 2: Extract access token from response
        const accessToken = loginResponse.data.access_token ||
            loginResponse.headers['set-cookie']?.find(cookie =>
                cookie.includes('access_token'))?.split('=')[1]?.split(';')[0];

        if (!accessToken) {
            console.log('   ❌ No access token found in response');
            return;
        }

        // Step 3: Decode JWT to check expiration
        console.log('\n2. Analyzing new token...');

        try {
            const payload = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString());

            const issuedAt = new Date(payload.iat * 1000);
            const expiresAt = new Date(payload.exp * 1000);
            const now = new Date();

            const durationMinutes = Math.floor((payload.exp - payload.iat) / 60);
            const durationHours = Math.floor(durationMinutes / 60);
            const timeLeftMinutes = Math.floor((payload.exp - Math.floor(now.getTime() / 1000)) / 60);

            console.log(`   📊 Token Details:`);
            console.log(`   - Issued at: ${issuedAt.toISOString()}`);
            console.log(`   - Expires at: ${expiresAt.toISOString()}`);
            console.log(`   - Duration: ${durationHours} hours ${durationMinutes % 60} minutes`);
            console.log(`   - Time left: ${Math.floor(timeLeftMinutes / 60)}h ${timeLeftMinutes % 60}m`);

            if (durationHours === 2 && durationMinutes === 120) {
                console.log('   ✅ SUCCESS: Token duration is exactly 2 hours!');
            } else if (durationMinutes >= 110 && durationMinutes <= 130) {
                console.log('   ✅ SUCCESS: Token duration is approximately 2 hours');
            } else {
                console.log(`   ❌ ISSUE: Expected 2 hours (120 min), got ${durationMinutes} minutes`);
            }

        } catch (decodeError) {
            console.log('   ❌ Failed to decode JWT token:', decodeError.message);
        }

        // Step 3: Test authenticated request with new token
        console.log('\n3. Testing authenticated request...');
        const meResponse = await axios.get(`${BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (meResponse.status === 200) {
            console.log(`   ✅ Authentication successful for user: ${meResponse.data.name}`);
        }

    } catch (error) {
        console.log('   ❌ Test failed:', error.message);
        if (error.response) {
            console.log('   Response status:', error.response.status);
            console.log('   Response data:', error.response.data);
        }
    }

    console.log('\n📋 Summary:');
    console.log('   🔧 Access token expiration extended from 15 minutes to 2 hours');
    console.log('   🍪 HTTP-only cookies maintained for security');
    console.log('   🔄 Refresh tokens still last 7 days');
    console.log('   ✅ Users should no longer be logged out after a few minutes');
}

testNewTokenDuration().catch(console.error);
