const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testViewCounting() {
  console.log('🧪 Testing View Counting with IP Tracking...\n');

  // Replace with an actual job ID from your database
  const jobId = 'cmcxeapjd0001iuc1g5tnkft5';

  try {
    console.log('1. Getting initial view count...');
    let response = await axios.get(`${BASE_URL}/jobs/public/${jobId}`, {
      headers: {
        'X-Forwarded-For': '192.168.1.100', // Simulate first IP
      }
    });
    const initialViews = response.data.views;
    console.log(`   Initial views: ${initialViews}`);

    console.log('\n2. Viewing job again from same IP (should NOT increment)...');
    response = await axios.get(`${BASE_URL}/jobs/public/${jobId}`, {
      headers: {
        'X-Forwarded-For': '192.168.1.100', // Same IP
      }
    });
    console.log(`   Views after same IP: ${response.data.views} (should be ${initialViews})`);

    console.log('\n3. Viewing job from different IP (should increment)...');
    response = await axios.get(`${BASE_URL}/jobs/public/${jobId}`, {
      headers: {
        'X-Forwarded-For': '192.168.1.101', // Different IP
      }
    });
    console.log(`   Views after different IP: ${response.data.views} (should be ${initialViews + 1})`);

    console.log('\n4. Viewing job from another different IP (should increment)...');
    response = await axios.get(`${BASE_URL}/jobs/public/${jobId}`, {
      headers: {
        'X-Forwarded-For': '192.168.1.102', // Another different IP
      }
    });
    console.log(`   Views after another IP: ${response.data.views} (should be ${initialViews + 2})`);

    console.log('\n5. Testing multiple requests from same IP (should NOT increment)...');
    for (let i = 0; i < 3; i++) {
      await axios.get(`${BASE_URL}/jobs/public/${jobId}`, {
        headers: {
          'X-Forwarded-For': '192.168.1.102', // Same IP as step 4
        }
      });
    }
    response = await axios.get(`${BASE_URL}/jobs/public/${jobId}`, {
      headers: {
        'X-Forwarded-For': '192.168.1.102',
      }
    });
    console.log(`   Views after multiple same IP requests: ${response.data.views} (should still be ${initialViews + 2})`);

    console.log('\n✅ View counting test completed!');
    console.log('\n📊 Summary:');
    console.log(`   - Initial views: ${initialViews}`);
    console.log(`   - Final views: ${response.data.views}`);
    console.log(`   - Total new views added: ${response.data.views - initialViews}`);
    console.log(`   - Expected new views: 2 (from 2 different IPs)`);

  } catch (error) {
    console.error('❌ Error testing view counting:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testViewCounting();
