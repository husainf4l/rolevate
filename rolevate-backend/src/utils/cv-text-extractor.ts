import axios from 'axios';
import * as fs from 'fs-extra';
import * as path from 'path';
const pdfParse = require('pdf-parse');
import mammoth from 'mammoth';

export async function downloadFile(url: string, dest: string): Promise<void> {
  const writer = fs.createWriteStream(dest);
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
  });
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

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

  const ext = path.extname(fileUrl).toLowerCase() || '.pdf';
  console.log('📎 File extension detected:', ext);
  
  if (!ext || !['.pdf', '.docx', '.doc', '.txt'].includes(ext)) {
    throw new Error(`Unsupported file type: ${ext}. Supported types: .pdf, .docx, .doc, .txt`);
  }

  // Check if it's a remote URL (S3, HTTP) or local file
  const isRemoteFile = fileUrl.startsWith('http') || fileUrl.includes('amazonaws.com');
  const isLocalFile = fileUrl.startsWith('/') || fileUrl.includes('uploads/cvs/') || fileUrl.startsWith('/api/uploads/');
  
  let fileBuffer: Buffer;

  if (isRemoteFile) {
    console.log('🌐 Processing remote file (S3/HTTP)...');
    fileBuffer = await downloadFileBuffer(fileUrl);
  } else if (isLocalFile) {
    console.log('📁 Processing local file...');
    
    // Clean up the path to remove API prefix and construct proper local path
    let localPath = fileUrl;
    
    // Remove /api prefix if present
    if (localPath.startsWith('/api/')) {
      localPath = localPath.replace('/api/', '');
    }
    
    // Remove leading slash if present (for relative paths)
    if (localPath.startsWith('/uploads/')) {
      localPath = localPath.substring(1); // Remove leading slash to make it relative
    }
    
    // Construct full path from project root
    const fullPath = path.join(process.cwd(), localPath);
    
    console.log('📁 Original URL:', fileUrl);
    console.log('📁 Cleaned path:', localPath);
    console.log('📁 Full path:', fullPath);
    
    if (!(await fs.pathExists(fullPath))) {
      throw new Error(`Local file not found: ${fullPath}`);
    }
    
    fileBuffer = await fs.readFile(fullPath);
  } else {
    throw new Error('Unsupported file URL format');
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
