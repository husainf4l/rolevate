// Check the JWT token from cookies
const fs = require('fs');

// Read cookies from file
const cookiesContent = fs.readFileSync('cookies.txt', 'utf8');
console.log('Cookies file content:');
console.log(cookiesContent);

// Extract access_token from cookies
const lines = cookiesContent.split('\n');
let accessToken = null;

for (const line of lines) {
  if (line.includes('access_token')) {
    // Parse the cookie line format
    const parts = line.split('\t');
    if (parts.length >= 7) {
      accessToken = parts[6]; // Cookie value is typically the 7th field
    }
  }
}

if (!accessToken) {
  console.log('No access token found in cookies');
  process.exit(1);
}

console.log('\nAccess token found:', accessToken.substring(0, 20) + '...');

try {
  // Decode JWT payload without verification
  const payload = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString());
  const now = Math.floor(Date.now() / 1000);
  
  console.log('\nJWT Payload:');
  console.log('- Email:', payload.email);
  console.log('- User ID:', payload.sub);
  console.log('- User Type:', payload.userType);
  console.log('- Issued at:', new Date(payload.iat * 1000).toISOString());
  console.log('- Expires at:', new Date(payload.exp * 1000).toISOString());
  console.log('- Current time:', new Date(now * 1000).toISOString());
  console.log('- Time until expiration:', payload.exp - now, 'seconds');
  
  if (now > payload.exp) {
    console.log('\n❌ TOKEN IS EXPIRED! This explains the 401 error.');
    console.log('   Need to use /refresh endpoint to get a new token.');
  } else {
    console.log('\n✅ Token is still valid. The issue is elsewhere.');
  }
  
} catch (error) {
  console.error('Error decoding JWT:', error);
}
