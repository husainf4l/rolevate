const fetch = require('node-fetch');

async function testAuthMe() {
  try {
    console.log('🚀 Testing /auth/me endpoint...');
    
    // First login to get access token
    const loginResponse = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      }),
    });

    if (!loginResponse.ok) {
      console.error('❌ Login failed:', await loginResponse.text());
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful');
    console.log('User type:', loginData.user?.userType);
    console.log('Has candidate profile in login response:', !!loginData.user?.candidateProfile);
    
    if (loginData.user?.candidateProfile) {
      console.log('CV URL in login response:', loginData.user.candidateProfile.resumeUrl);
    }

    const accessToken = loginData.access_token;
    
    // Test /auth/me endpoint
    console.log('\n🔍 Testing /auth/me...');
    const meResponse = await fetch('http://localhost:3000/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!meResponse.ok) {
      console.error('❌ /auth/me failed:', await meResponse.text());
      return;
    }

    const meData = await meResponse.json();
    console.log('✅ /auth/me successful');
    console.log('User type:', meData.userType);
    console.log('Has candidate profile:', !!meData.candidateProfile);
    
    if (meData.candidateProfile) {
      console.log('✅ Candidate profile found!');
      console.log('CV URL:', meData.candidateProfile.resumeUrl);
      console.log('First name:', meData.candidateProfile.firstName);
      console.log('Last name:', meData.candidateProfile.lastName);
    } else {
      console.log('❌ No candidate profile in /auth/me response');
    }
    
    console.log('\n📋 Full /auth/me response:');
    console.log(JSON.stringify(meData, null, 2));

  } catch (error) {
    console.error('💥 Error during test:', error.message);
  }
}

testAuthMe();
