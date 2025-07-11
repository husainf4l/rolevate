const axios = require('axios');
const fs = require('fs');

async function testAuthMe() {
    try {
        // Read the token from cookies.txt
        if (!fs.existsSync('./cookies.txt')) {
            console.log('❌ No cookies.txt file found. Please login first.');
            return;
        }

        const cookieFileContent = fs.readFileSync('./cookies.txt', 'utf8').trim();
        console.log('🔑 Reading cookies from cookies.txt');
        
        // Extract access_token from the curl cookie format
        const accessTokenMatch = cookieFileContent.match(/access_token\s+([^\s\n]+)/);
        if (!accessTokenMatch) {
            console.log('❌ No access_token found in cookies.txt');
            return;
        }
        
        const accessToken = accessTokenMatch[1];
        console.log('🍪 Extracted access token:', accessToken.substring(0, 50) + '...');

        // Test /auth/me endpoint
        const response = await axios.get('http://localhost:4005/api/auth/me', {
            headers: {
                'Cookie': `access_token=${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ /auth/me response status:', response.status);
        console.log('📋 Response data:');
        console.log(JSON.stringify(response.data, null, 2));

        // Check if candidate profile is included
        if (response.data.candidateProfile) {
            console.log('✅ Candidate profile found in response!');
            if (response.data.candidateProfile.resumeUrl) {
                console.log('✅ CV URL found:', response.data.candidateProfile.resumeUrl);
            } else {
                console.log('⚠️ No CV URL in candidate profile');
            }
        } else {
            console.log('❌ No candidate profile in response');
        }

    } catch (error) {
        console.error('❌ Error testing /auth/me:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

testAuthMe();
