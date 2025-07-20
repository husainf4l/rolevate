// Test CV text extraction with the fixed path
const { extractTextFromCV } = require('./src/utils/cv-text-extractor');

async function testCVExtraction() {
  console.log('🧪 Testing CV text extraction with fixed path...');
  
  const testUrl = '/api/uploads/cvs/cmcvvinsb0000iul6uunqgsd0/cv_89d96f20-a3d8-44ad-bfe0-ab58cf830363.pdf';
  
  try {
    console.log('📄 Extracting text from:', testUrl);
    const text = await extractTextFromCV(testUrl);
    
    console.log('✅ CV text extraction successful!');
    console.log('📊 Text length:', text.length);
    console.log('📄 Text preview (first 300 chars):');
    console.log(text.substring(0, 300) + '...');
    
  } catch (error) {
    console.error('❌ CV text extraction failed:', error.message);
  }
}

testCVExtraction();
