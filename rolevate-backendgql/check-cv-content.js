const fs = require('fs');
const pdfParse = require('pdf-parse');

// Simple PDF text extraction to check CV content
async function checkCV() {
  try {
    const cvPath = '/Users/husain/Desktop/rolevate/rolevate-backendgql/AlHussein_Resume_2 (1).pdf';

    if (!fs.existsSync(cvPath)) {
      console.log('CV file not found at:', cvPath);
      return;
    }

    const buffer = fs.readFileSync(cvPath);
    console.log('CV file size:', buffer.length, 'bytes');

    // Try basic PDF parsing
    const data = await pdfParse(buffer);
    const text = data.text?.trim() || '';

    console.log('Extracted text length:', text.length);
    console.log('First 500 characters:');
    console.log(text.substring(0, 500));
    console.log('...');

    // Check for sales-related keywords
    const salesKeywords = ['sales', 'manager', 'leadership', 'team', 'market', 'communication', 'negotiation', 'customer', 'strategy'];
    const foundKeywords = salesKeywords.filter(keyword =>
      text.toLowerCase().includes(keyword.toLowerCase())
    );

    console.log('Sales-related keywords found:', foundKeywords);

  } catch (error) {
    console.error('Error checking CV:', error);
  }
}

checkCV();