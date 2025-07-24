import axios from 'axios';
const pdfParse = require('pdf-parse');
import mammoth from 'mammoth';

export async function downloadFileBuffer(url: string): Promise<Buffer> {
  console.log('📥 Downloading file buffer from URL:', url);
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'arraybuffer',
  });
  return Buffer.from(response.data);
}

export async function extractTextFromCV(fileUrl: string): Promise<string> {
  console.log('📥 Starting CV text extraction from URL:', fileUrl);
  
  // Check if the URL is accessible
  if (!fileUrl || typeof fileUrl !== 'string') {
    throw new Error('Invalid file URL provided');
  }

  // Extract file extension from URL
  const urlParts = fileUrl.split('.');
  const ext = urlParts.length > 1 ? '.' + urlParts[urlParts.length - 1].toLowerCase().split('?')[0] : '.pdf';
  console.log('📎 File extension detected:', ext);
  
  if (!ext || !['.pdf', '.docx', '.doc', '.txt'].includes(ext)) {
    throw new Error(`Unsupported file type: ${ext}. Supported types: .pdf, .docx, .doc, .txt`);
  }

  // All CV files are now stored in S3
  const isS3File = fileUrl.startsWith('http') || fileUrl.includes('amazonaws.com');
  
  let fileBuffer: Buffer;

  if (isS3File) {
    console.log('☁️ Processing S3 file...');
    fileBuffer = await downloadFileBuffer(fileUrl);
  } else {
    throw new Error('Only S3 URLs are supported. All CV files must be stored in AWS S3.');
  }
  
  try {
    // Check if buffer has content
    console.log('📊 File buffer size:', fileBuffer.length, 'bytes');
    
    if (fileBuffer.length === 0) {
      throw new Error('File is empty');
    }

    let text = '';
    
    if (ext === '.pdf') {
      console.log('📄 Processing PDF file...');
      const pdf = await pdfParse(fileBuffer);
      text = pdf.text;
      console.log('📄 PDF text extracted, length:', text.length);
    } else if (ext === '.docx' || ext === '.doc') {
      console.log('📄 Processing Word document...');
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      text = result.value;
      console.log('📄 Word text extracted, length:', text.length);
    } else if (ext === '.txt') {
      console.log('📄 Processing text file...');
      text = fileBuffer.toString('utf-8');
      console.log('📄 Text file read, length:', text.length);
    }

    // Clean up the text
    text = text.trim();
    
    if (text.length === 0) {
      throw new Error('No text could be extracted from the CV file');
    }

    console.log('✅ CV text extraction successful, final length:', text.length);
    return text;
    
  } catch (error) {
    console.error('❌ CV text extraction failed:', error.message);
    throw error;
  }
}
