const axios = require('axios');

async function checkTemplates() {
  try {
    // Login first
    const loginResponse = await axios.post('http://localhost:4005/api/auth/login', {
      email: 'al-hussein@papayatrading.com',
      password: 'papaya321'
    });
    
    console.log('Login response status:', loginResponse.status);
    
    const cookieHeader = loginResponse.headers['set-cookie']?.join('; ') || '';
    
    // Get templates
    const templatesResponse = await axios.get('http://localhost:4005/api/communications', {
      headers: {
        'Cookie': cookieHeader
      }
    });
    
    console.log('Templates response status:', templatesResponse.status);
    console.log('\n=== AVAILABLE TEMPLATES ===');
    console.log(JSON.stringify(templatesResponse.data, null, 2));
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

checkTemplates();
