const axios = require('axios');

const baseURL = 'http://localhost:4005/api';

// Configure axios to handle cookies
const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

async function testLoginFlow() {
  console.log('=== Testing Login Flow ===');
  
  try {
    // Step 1: Login
    console.log('\n1. Attempting login...');
    const loginResponse = await axiosInstance.post('/auth/login', {
      email: 'husain.f4l@gmail.com',
      password: 'tt55oo77'
    });
    
    console.log('Login successful!');
    console.log('Response:', loginResponse.data);
    console.log('Set-Cookie headers:', loginResponse.headers['set-cookie']);
    
    // Step 2: Test /me endpoint immediately
    console.log('\n2. Testing /me endpoint...');
    const meResponse = await axiosInstance.get('/auth/me');
    console.log('Me endpoint successful!');
    console.log('User data:', meResponse.data);
    
    // Step 3: Wait a moment and test refresh
    console.log('\n3. Testing refresh endpoint...');
    const refreshResponse = await axiosInstance.post('/auth/refresh');
    console.log('Refresh successful!');
    console.log('Response:', refreshResponse.data);
    
    // Step 4: Test /me endpoint again after refresh
    console.log('\n4. Testing /me endpoint after refresh...');
    const meResponse2 = await axiosInstance.get('/auth/me');
    console.log('Me endpoint after refresh successful!');
    console.log('User data:', meResponse2.data);
    
    console.log('\n=== All tests passed! ===');
    
  } catch (error) {
    console.error('\n=== Error occurred ===');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testLoginFlow();
