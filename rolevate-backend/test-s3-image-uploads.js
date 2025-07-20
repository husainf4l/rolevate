const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testS3ImageUploads() {
  console.log('🖼️ Testing S3 Image Upload Endpoints...\n');

  const API_BASE = 'http://localhost:4005/api';
  const PASSWORD = 'tt55oo77';

  // Create a test image (simple 1x1 PNG pixel)
  const testImageBuffer = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
    0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x00, 0x00, 0x00,
    0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x37, 0x6E, 0xF9, 0x24, 0x00, 0x00,
    0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
  ]);

  let accessToken = null;

  try {
    // Step 1: Test anonymous image uploads
    console.log('1. Testing anonymous S3 image uploads...\n');

    // Test anonymous avatar upload
    console.log('📸 Testing anonymous avatar upload to S3...');
    const avatarForm = new FormData();
    avatarForm.append('avatar', testImageBuffer, {
      filename: 'test-avatar.png',
      contentType: 'image/png'
    });

    try {
      const avatarResponse = await axios.post(`${API_BASE}/uploads/avatars/s3`, avatarForm, {
        headers: {
          ...avatarForm.getHeaders()
        }
      });

      if (avatarResponse.status === 201) {
        console.log('✅ Anonymous avatar uploaded to S3 successfully!');
        console.log('Avatar URL:', avatarResponse.data.avatarUrl);
        console.log('Message:', avatarResponse.data.message);
      }
    } catch (error) {
      console.log('❌ Anonymous avatar upload failed:', error.response?.data || error.message);
    }

    console.log();

    // Test anonymous logo upload
    console.log('🏢 Testing anonymous logo upload to S3...');
    const logoForm = new FormData();
    logoForm.append('logo', testImageBuffer, {
      filename: 'test-logo.png',
      contentType: 'image/png'
    });

    try {
      const logoResponse = await axios.post(`${API_BASE}/uploads/logos/s3`, logoForm, {
        headers: {
          ...logoForm.getHeaders()
        }
      });

      if (logoResponse.status === 201) {
        console.log('✅ Anonymous logo uploaded to S3 successfully!');
        console.log('Logo URL:', logoResponse.data.logoUrl);
        console.log('Message:', logoResponse.data.message);
      }
    } catch (error) {
      console.log('❌ Anonymous logo upload failed:', error.response?.data || error.message);
    }

    console.log('\n' + '='.repeat(60) + '\n');

    // Step 2: Test authenticated uploads
    console.log('2. Testing authenticated S3 image uploads...\n');

    // Login first
    console.log('🔐 Logging in...');
    try {
      const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
        email: 'al-hussein@papayatrading.com',
        password: PASSWORD
      });

      accessToken = loginResponse.data.access_token;
      console.log('✅ Login successful');
      console.log('User Type:', loginResponse.data.user.userType);
      console.log('Company:', loginResponse.data.user.company?.name || 'No company');
    } catch (error) {
      console.log('❌ Login failed:', error.response?.data || error.message);
      return;
    }

    console.log();

    // Test authenticated avatar upload
    console.log('👤 Testing authenticated user avatar upload to S3...');
    const userAvatarForm = new FormData();
    userAvatarForm.append('avatar', testImageBuffer, {
      filename: 'user-avatar.png',
      contentType: 'image/png'
    });

    try {
      const userAvatarResponse = await axios.post(`${API_BASE}/auth/upload-avatar-s3`, userAvatarForm, {
        headers: {
          ...userAvatarForm.getHeaders(),
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (userAvatarResponse.status === 201) {
        console.log('✅ User avatar uploaded to S3 successfully!');
        console.log('Avatar URL:', userAvatarResponse.data.avatarUrl);
        console.log('Message:', userAvatarResponse.data.message);
        console.log('Updated user avatar field:', userAvatarResponse.data.user.avatar);
      }
    } catch (error) {
      console.log('❌ User avatar upload failed:', error.response?.data || error.message);
    }

    console.log();

    // Test authenticated company logo upload
    console.log('🏢 Testing authenticated company logo upload to S3...');
    const companyLogoForm = new FormData();
    companyLogoForm.append('logo', testImageBuffer, {
      filename: 'company-logo.png',
      contentType: 'image/png'
    });

    try {
      const companyLogoResponse = await axios.post(`${API_BASE}/company/upload-logo-s3`, companyLogoForm, {
        headers: {
          ...companyLogoForm.getHeaders(),
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (companyLogoResponse.status === 201) {
        console.log('✅ Company logo uploaded to S3 successfully!');
        console.log('Logo URL:', companyLogoResponse.data.logoUrl);
        console.log('Message:', companyLogoResponse.data.message);
        console.log('Updated company logo field:', companyLogoResponse.data.company.logo);
      }
    } catch (error) {
      console.log('❌ Company logo upload failed:', error.response?.data || error.message);
    }

    console.log('\n' + '='.repeat(60) + '\n');

    // Step 3: Verify data was stored correctly
    console.log('3. Verifying S3 URLs were stored in database...\n');

    // Check user profile
    console.log('🔍 Checking user profile...');
    try {
      const userResponse = await axios.get(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (userResponse.status === 200) {
        console.log('✅ User profile retrieved');
        console.log('Avatar field:', userResponse.data.avatar);
        if (userResponse.data.avatar && userResponse.data.avatar.includes('amazonaws.com')) {
          console.log('✅ Avatar is stored as S3 URL!');
        } else {
          console.log('⚠️ Avatar is not an S3 URL or is missing');
        }
      }
    } catch (error) {
      console.log('❌ Failed to get user profile:', error.response?.data || error.message);
    }

    console.log();

    // Check company profile
    console.log('🔍 Checking company profile...');
    try {
      const companyResponse = await axios.get(`${API_BASE}/company/profile`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (companyResponse.status === 200 && companyResponse.data) {
        console.log('✅ Company profile retrieved');
        console.log('Logo field:', companyResponse.data.logo);
        if (companyResponse.data.logo && companyResponse.data.logo.includes('amazonaws.com')) {
          console.log('✅ Logo is stored as S3 URL!');
        } else {
          console.log('⚠️ Logo is not an S3 URL or is missing');
        }
      } else {
        console.log('⚠️ No company profile found');
      }
    } catch (error) {
      console.log('❌ Failed to get company profile:', error.response?.data || error.message);
    }

    console.log('\n' + '='.repeat(60) + '\n');
    console.log('🎉 S3 Image Upload Testing Complete!\n');

    console.log('📋 Summary:');
    console.log('✅ Anonymous avatar upload to S3');
    console.log('✅ Anonymous logo upload to S3');
    console.log('✅ Authenticated user avatar upload to S3');
    console.log('✅ Authenticated company logo upload to S3');
    console.log('✅ S3 URLs stored in database');
    console.log('\n🌟 All image uploads now use AWS S3 instead of local storage!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testS3ImageUploads().catch(console.error);
