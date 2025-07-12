const crypto = require('crypto');

function generateSecureSecret(length = 64) {
  return crypto.randomBytes(length).toString('hex');
}

console.log('🔐 Generating secure secrets for production...\n');

// Generate JWT secret (256 bits = 32 bytes = 64 hex chars)
const jwtSecret = generateSecureSecret(32);
console.log('JWT_SECRET:', jwtSecret);

// Generate encryption key (256 bits = 32 bytes = 64 hex chars)  
const encryptionKey = generateSecureSecret(32);
console.log('ENCRYPTION_KEY:', encryptionKey);

// Generate a strong demo password that meets security policy
function generateSecurePassword() {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()';
  
  // Ensure at least one from each category
  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill remaining with random characters
  const allChars = uppercase + lowercase + numbers + symbols;
  for (let i = 4; i < 12; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

const demoPassword = generateSecurePassword();
console.log('\n🔑 Demo password for all users:', demoPassword);

console.log('\n📋 Update your .env file with these values:');
console.log(`JWT_SECRET=${jwtSecret}`);
console.log(`ENCRYPTION_KEY=${encryptionKey}`);
console.log(`\n👤 All user passwords will be updated to: ${demoPassword}`);
console.log('\n⚠️  Remember to change these in production and use proper secret management!');

module.exports = { jwtSecret, encryptionKey, demoPassword };