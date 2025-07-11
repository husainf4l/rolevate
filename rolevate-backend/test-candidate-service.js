const axios = require('axios');

async function testCandidateService() {
    try {
        console.log('=== Testing Candidate Service ===');
        
        // First, login to get a token
        const loginResponse = await axios.post('http://localhost:4005/api/auth/login', {
            email: 'husain.f4l@gmail.com',
            password: 'tt55oo77'
        }, {
            withCredentials: true
        });
        
        const cookies = loginResponse.headers['set-cookie'];
        const accessTokenCookie = cookies?.find(cookie => cookie.startsWith('access_token='));
        const accessToken = accessTokenCookie.split('=')[1].split(';')[0];
        
        console.log('✅ Login successful, got access token');
        
        // Try to call a candidate endpoint if it exists
        // First, let's see what candidate endpoints are available
        console.log('\n🔍 Testing candidate profile endpoints...');
        
        try {
            // This might not exist, but let's try
            const profileResponse = await axios.get('http://localhost:4005/api/candidate/profile', {
                headers: {
                    'Cookie': `access_token=${accessToken}`
                }
            });
            console.log('✅ /candidate/profile response:', profileResponse.data);
        } catch (error) {
            if (error.response?.status === 404) {
                console.log('❌ /candidate/profile endpoint not found (404)');
            } else {
                console.log('❌ /candidate/profile error:', error.response?.status, error.response?.data);
            }
        }
        
        // Now let's directly test what happens when getUserById tries to fetch candidate profile
        console.log('\n🔧 Testing getUserById candidate profile fetch...');
        const meResponse = await axios.get('http://localhost:4005/api/auth/me', {
            headers: {
                'Cookie': `access_token=${accessToken}`
            }
        });
        
        console.log('📋 /auth/me response:');
        console.log(JSON.stringify(meResponse.data, null, 2));
        
        if (meResponse.data.candidateProfile) {
            console.log('✅ Candidate profile IS included!');
            if (meResponse.data.candidateProfile.resumeUrl) {
                console.log('✅ CV URL found:', meResponse.data.candidateProfile.resumeUrl);
            } else {
                console.log('⚠️ Candidate profile found but no CV URL');
            }
        } else {
            console.log('❌ Candidate profile NOT included in /auth/me response');
            console.log('🔍 This indicates candidateService.findProfileByUserId() is failing');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

testCandidateService();
