const fs = require('fs');
const path = require('path');

async function testImageUploads() {
  console.log('=== Testing Image Upload Endpoints ===\n');

  // Create a simple test image (1x1 PNG pixel)
  const testImageBuffer = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
    0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x00, 0x00, 0x00,
    0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x37, 0x6E, 0xF9, 0x24, 0x00, 0x00,
    0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
  ]);

  const testImagePath = path.join(__dirname, 'test-image.png');
  fs.writeFileSync(testImagePath, testImageBuffer);

  const API_BASE = 'http://localhost:4005';

  try {
    // Step 1: Login
    console.log('1. Logging in...');
    const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'al-hussein@papayatrading.com',
        password: 'tt55oo77'
      })
    });

    if (!loginResponse.ok) {
      console.error('Login failed:', loginResponse.status);
      return;
    }

    console.log('✓ Login successful');
    
    // Extract token from Set-Cookie header
    const cookies = loginResponse.headers.get('set-cookie');
    let accessToken = null;
    if (cookies) {
      const tokenMatch = cookies.match(/access_token=([^;]+)/);
      if (tokenMatch) {
        accessToken = tokenMatch[1];
        console.log('✓ Token extracted from cookie');
      }
    }
    
    if (!accessToken) {
      console.error('❌ No access token found in response');
      return;
    }

    // Step 2: Test company logo upload
    console.log('\n2. Testing company logo upload...');
    const logoFormData = new FormData();
    const logoFile = new File([testImageBuffer], 'test-logo.png', { type: 'image/png' });
    logoFormData.append('logo', logoFile);

    const logoResponse = await fetch(`${API_BASE}/api/company/upload-logo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      body: logoFormData
    });

    if (logoResponse.ok) {
      const logoResult = await logoResponse.json();
      console.log('✓ Company logo uploaded:', JSON.stringify(logoResult, null, 2));
    } else {
      const logoError = await logoResponse.text();
      console.error('❌ Logo upload failed:', logoResponse.status, logoError);
    }

    // Step 3: Test user avatar upload
    console.log('\n3. Testing user avatar upload...');
    const avatarFormData = new FormData();
    const avatarFile = new File([testImageBuffer], 'test-avatar.png', { type: 'image/png' });
    avatarFormData.append('avatar', avatarFile);

    const avatarResponse = await fetch(`${API_BASE}/api/auth/upload-avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      body: avatarFormData
    });

    if (avatarResponse.ok) {
      const avatarResult = await avatarResponse.json();
      console.log('✓ User avatar uploaded:', JSON.stringify(avatarResult, null, 2));
    } else {
      const avatarError = await avatarResponse.text();
      console.error('❌ Avatar upload failed:', avatarResponse.status, avatarError);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    // Clean up test file
    try {
      fs.unlinkSync(testImagePath);
    } catch (e) {
      // File might not exist
    }
  }

  console.log('\n=== Test Complete ===');
}

testImageUploads().catch(console.error);
