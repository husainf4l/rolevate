// Test CV Upload Manually
// Run this in browser console at http://localhost:3005/userdashboard/profile

// Step 1: Test if uploadCV function works
import { uploadCV } from '@/services/cv';

// Create a test file
const testContent = 'test content';
const blob = new Blob([testContent], { type: 'application/pdf' });
const file = new File([blob], 'test.pdf', { type: 'application/pdf' });

// Try upload
console.log('Starting upload test...');
uploadCV(file).then(url => {
  console.log('Upload successful! URL:', url);
}).catch(err => {
  console.error('Upload failed:', err);
});
