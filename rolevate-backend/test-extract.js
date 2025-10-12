import { extractTextFromCV } from './src/utils/cv-text-extractor.js';

async function testExtract() {
  try {
    // Test with a URL that might exist or not
    const testUrl = 'https://4wk-garage-media.s3.me-central-1.amazonaws.com/cvs/test.pdf';
    console.log('Testing CV extraction with URL:', testUrl);
    const text = await extractTextFromCV(testUrl);
    console.log('Extracted text:', text);
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testExtract();