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

export async function extractTextFromCV(fileUrl: string): Promise<string> {
  console.log('📥 Starting CV text extraction from URL:', fileUrl);
  
  // Check if the URL is accessible
  if (!fileUrl || typeof fileUrl !== 'string') {
    throw new Error('Invalid file URL provided');
  }

  const ext = path.extname(fileUrl).toLowerCase();
  console.log('📎 File extension detected:', ext);
  
  if (!ext || !['.pdf', '.docx', '.doc', '.txt'].includes(ext)) {
    throw new Error(`Unsupported file type: ${ext}. Supported types: .pdf, .docx, .doc, .txt`);
  }

  // Check if it's a local file path or a URL
  const isLocalFile = fileUrl.startsWith('/') || fileUrl.includes('uploads/cvs/');
  let tempFile: string;
  let needsCleanup = false;

  if (isLocalFile) {
    // Use the file directly if it's a local path
    const localPath = fileUrl.startsWith('http') 
      ? fileUrl.replace(/^https?:\/\/[^\/]+/, '') // Remove domain from URL
      : fileUrl;
    
    const fullPath = path.isAbsolute(localPath) 
      ? localPath 
      : path.join(process.cwd(), localPath);
    
    console.log('📁 Using local file:', fullPath);
    
    if (!(await fs.pathExists(fullPath))) {
      throw new Error(`Local file not found: ${fullPath}`);
    }
    
    tempFile = fullPath;
    needsCleanup = false;
  } else {
    // Download remote file
    tempFile = path.join('/tmp', `cv-${Date.now()}${ext}`);
    console.log('💾 Downloading file to temp location:', tempFile);
    await downloadFile(fileUrl, tempFile);
    needsCleanup = true;
  }
  
  try {
    // Check if file exists and has content
    const stats = await fs.stat(tempFile);
    console.log('📊 File size:', stats.size, 'bytes');
    
    if (stats.size === 0) {
      throw new Error('File is empty');
    }

    let text = '';
    
    if (ext === '.pdf') {
      console.log('📄 Processing PDF file...');
      const data = await fs.readFile(tempFile);
      const pdf = await pdfParse(data);
      text = pdf.text;
      console.log('📄 PDF text extracted, length:', text.length);
    } else if (ext === '.docx' || ext === '.doc') {
      console.log('📄 Processing Word document...');
      const data = await fs.readFile(tempFile);
      const result = await mammoth.extractRawText({ buffer: data });
      text = result.value;
      console.log('📄 Word text extracted, length:', text.length);
    } else if (ext === '.txt') {
      console.log('📄 Processing text file...');
      text = await fs.readFile(tempFile, 'utf-8');
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
  } finally {
    // Clean up temp file only if it was downloaded
    if (needsCleanup) {
      try {
        if (await fs.pathExists(tempFile)) {
          await fs.remove(tempFile);
          console.log('🗑️ Temp file cleaned up');
        }
      } catch (cleanupError) {
        console.warn('⚠️ Failed to clean up temp file:', cleanupError.message);
      }
    }
  }
}
