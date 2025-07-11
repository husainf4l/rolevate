const axios = require('axios');
const fs = require('fs');

async function debugAuthMeDetailed() {
    try {
        console.log('=== Debug Auth Me - Detailed ===');
        
        // First, get a fresh login
        console.log('\n1. Logging in...');
        const loginResponse = await axios.post('http://localhost:4005/api/auth/login', {
            email: 'husain.f4l@gmail.com',
            password: 'tt55oo77'
        }, {
            withCredentials: true
        });
        
        console.log('Login response status:', loginResponse.status);
        const cookies = loginResponse.headers['set-cookie'];
        console.log('Received cookies:', cookies);
        
        // Extract access token from Set-Cookie header
        const accessTokenCookie = cookies?.find(cookie => cookie.startsWith('access_token='));
        if (!accessTokenCookie) {
            console.log('❌ No access token cookie found');
            return;
        }
        
        // Parse the cookie value
        const accessToken = accessTokenCookie.split('=')[1].split(';')[0];
        console.log('🍪 Access token extracted:', accessToken.substring(0, 50) + '...');
        
        // Try decoding the JWT payload to verify contents
        try {
            const payload = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString());
            console.log('📋 JWT payload:', payload);
            console.log('  - sub (userId):', payload.sub);
            console.log('  - email:', payload.email);
            console.log('  - userType:', payload.userType);
            console.log('  - iat:', payload.iat, '(issued at)');
            console.log('  - exp:', payload.exp, '(expires at)');
            
            const now = Math.floor(Date.now() / 1000);
            console.log('  - Current time:', now);
            console.log('  - Token valid for:', payload.exp - now, 'seconds');
        } catch (e) {
            console.log('❌ Error decoding JWT:', e.message);
        }
        
        console.log('\n2. Testing /auth/me with proper cookie...');
        const meResponse = await axios.get('http://localhost:4005/api/auth/me', {
            headers: {
                'Cookie': `access_token=${accessToken}`
            }
        });
        
        console.log('✅ /auth/me successful!');
        console.log('Response:', JSON.stringify(meResponse.data, null, 2));
        
    } catch (error) {
        console.error('\n❌ Error occurred:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
            console.error('Headers:', error.response.headers);
        } else {
            console.error('Error:', error.message);
        }
    }
}

debugAuthMeDetailed();
