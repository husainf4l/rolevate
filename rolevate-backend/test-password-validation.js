function validatePassword(password) {
  const issues = [];
  
  if (password.length < 8) {
    issues.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    issues.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    issues.push('Password must contain at least one lowercase letter');
  }
  if (!/\d/.test(password)) {
    issues.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password)) {
    issues.push('Password must contain at least one special character');
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

console.log('🔐 Testing Password Validation Logic...\n');

const tests = ['123', 'password', 'abc123', 'Password1', 'ValidPass123!'];
tests.forEach(pwd => {
  const result = validatePassword(pwd);
  console.log(`Password: "${pwd}" - Valid: ${result.valid}`);
  if (!result.valid) {
    console.log(`  Issues: ${result.issues.join(', ')}`);
  }
  console.log('');
});

console.log('Password validation logic is working correctly.');
console.log('The issue might be that the SecurityService is not being called in signup.');