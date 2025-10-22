import axios from 'axios';
import { createWorker, PSM, OEM } from 'tesseract.js';
import sharp from 'sharp';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Jimp = require('jimp');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdf2pic = require('pdf2pic');
import mammoth from 'mammoth';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { CVErrorHandlingService } from '../services/cv-error-handling.service';
import { AwsS3Service } from '../services/aws-s3.service';

// Global error handler instance
const errorHandler = new CVErrorHandlingService();

// Supported file types with MIME types
export const SUPPORTED_CV_FORMATS = {
  // Document formats
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/rtf': ['.rtf'],
  'text/plain': ['.txt'],
  'application/vnd.oasis.opendocument.text': ['.odt'],
  
  // Image formats (for scanned CVs)
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/bmp': ['.bmp'],
  'image/tiff': ['.tiff', '.tif'],
  'image/webp': ['.webp']
};

export async function downloadFileBuffer(url: string, s3Service?: AwsS3Service): Promise<Buffer> {
  console.log('📥 Downloading file buffer from URL:', url);
  try {
    // Check if it's a presigned URL (contains AWS signature parameters)
    const isPresignedUrl = url.includes('X-Amz-Algorithm') && url.includes('X-Amz-Signature');

    if (isPresignedUrl) {
      // For presigned URLs, use axios directly
      console.log('🔗 Using axios to download presigned URL');
      const response = await axios({
        url,
        method: 'GET',
        responseType: 'arraybuffer',
        timeout: 30000, // 30 second timeout
        maxContentLength: 50 * 1024 * 1024, // 50MB max
      });

      const buffer = Buffer.from(response.data);
      console.log('✅ Downloaded file buffer via presigned URL, size:', buffer.length, 'bytes');
      return buffer;
    }

    // Check if it's an S3 URL and we have S3 service (for direct S3 access)
    if (s3Service && s3Service.isS3Url(url)) {
      console.log('☁️ Using S3 service to download file');
      return await s3Service.getFileBuffer(url);
    }

    // Fallback to axios for other URLs
    console.log('🌐 Using axios to download file');
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'arraybuffer',
      timeout: 30000, // 30 second timeout
      maxContentLength: 50 * 1024 * 1024, // 50MB max
    });

    const buffer = Buffer.from(response.data);
    console.log('✅ Downloaded file buffer, size:', buffer.length, 'bytes');
    return buffer;
  } catch (error) {
    console.error('❌ Failed to download file:', error.message);
    throw new Error(`Failed to download file: ${error.message}`);
  }
}

/**
 * Enhanced CV text extraction with support for multiple formats and OCR
 */
export async function extractTextFromCV(fileUrl: string, s3Service?: AwsS3Service): Promise<string> {
  console.log('📥 Starting enhanced CV text extraction from URL:', fileUrl);
  
  // Validate input
  if (!fileUrl || typeof fileUrl !== 'string') {
    console.error('❌ Invalid file URL provided');
    throw new Error('Invalid file URL provided');
  }

  // Extract file extension and determine MIME type
  const urlParts = fileUrl.split('.');
  const ext = urlParts.length > 1 ? '.' + urlParts[urlParts.length - 1].toLowerCase().split('?')[0] : '.pdf';
  console.log('📎 File extension detected:', ext);
  
  // Validate supported format
  const supportedExtensions = Object.values(SUPPORTED_CV_FORMATS).flat();
  if (!supportedExtensions.includes(ext)) {
    const supportedList = supportedExtensions.join(', ');
    console.error('❌ Unsupported file type:', ext, 'Supported types:', supportedList);
    throw new Error(`Unsupported file type: ${ext}. Supported types: ${supportedList}`);
  }

  // Download file
  const isS3File = fileUrl.startsWith('http') || fileUrl.includes('amazonaws.com');
  if (!isS3File) {
    console.error('❌ Only S3 URLs are supported');
    throw new Error('Only S3 URLs are supported. All CV files must be stored in AWS S3.');
  }

  console.log('☁️ Downloading file from S3...');
  const fileBuffer = await downloadFileBuffer(fileUrl, s3Service);
  
  // Validate file content
  if (fileBuffer.length === 0) {
    console.error('❌ Downloaded file is empty');
    throw new Error('File is empty');
  }
  
  if (fileBuffer.length > 50 * 1024 * 1024) { // 50MB limit
    console.error('❌ File too large:', fileBuffer.length, 'bytes');
    throw new Error('File too large. Maximum size is 50MB.');
  }

  console.log('📊 File buffer size:', fileBuffer.length, 'bytes');

  try {
    let extractedText = '';
    
    // Determine file type and extract text accordingly
    if (ext === '.pdf') {
      extractedText = await extractFromPDF(fileBuffer);
    } else if (['.doc', '.docx'].includes(ext)) {
      extractedText = await extractFromWord(fileBuffer);
    } else if (ext === '.rtf') {
      extractedText = await extractFromRTF(fileBuffer);
    } else if (ext === '.txt') {
      extractedText = await extractFromText(fileBuffer);
    } else if (ext === '.odt') {
      extractedText = await extractFromODT(fileBuffer);
    } else if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.tif', '.webp'].includes(ext)) {
      extractedText = await extractFromImage(fileBuffer);
    } else {
      throw new Error(`Extraction method not implemented for ${ext}`);
    }

    // Clean and validate extracted text
    extractedText = cleanExtractedText(extractedText);
    
    if (!extractedText || extractedText.length < 10) {
      throw new Error('Insufficient text extracted from CV. The file may be corrupted or contain no readable text.');
    }

    console.log('✅ CV text extraction successful, final length:', extractedText.length);
    console.log('📄 Text preview (first 200 chars):', extractedText.substring(0, 200));
    
    return extractedText;
    
  } catch (error) {
    console.error('❌ CV text extraction failed:', error);
    
    // Use error handling service to provide user-friendly error
    const cvError = errorHandler.handleCVProcessingError(error, 'CV Text Extraction');
    throw new Error(cvError.userMessage);
  }
}

/**
 * Extract text from PDF documents
 * Handles both text-based and scanned PDFs
 */
async function extractFromPDF(buffer: Buffer): Promise<string> {
  console.log('📄 Processing PDF document...');
  
  try {
    // First, try standard PDF text extraction
    const pdfData = await pdfParse(buffer);
    let text = pdfData.text?.trim() || '';
    
    console.log('📄 PDF text extraction result:', text.length, 'characters');
    
    // If very little text was extracted, the PDF might be scanned (images)
    if (text.length < 50) {
      console.log('📄 Low text content detected, trying OCR on PDF pages...');
      text = await extractFromScannedPDF(buffer);
    }
    
    return text;
  } catch (error) {
    console.error('❌ PDF extraction error:', error.message);
    // Fallback to OCR if regular PDF parsing fails
    console.log('📄 Falling back to OCR for PDF...');
    return await extractFromScannedPDF(buffer);
  }
}

/**
 * Extract text from scanned PDF using OCR
 */
async function extractFromScannedPDF(buffer: Buffer): Promise<string> {
  console.log('📄 Converting PDF pages to images for OCR...');
  
  const tempDir = os.tmpdir();
  const tempPdfPath = path.join(tempDir, `cv-${Date.now()}.pdf`);
  
  try {
    // Write PDF to temporary file
    fs.writeFileSync(tempPdfPath, buffer);
    
    // Convert PDF pages to images
    const convert = pdf2pic.fromPath(tempPdfPath, {
      density: 300, // High DPI for better OCR
      saveFilename: 'cv-page',
      savePath: tempDir,
      format: 'png',
      width: 2480, // A4 width at 300 DPI
      height: 3508 // A4 height at 300 DPI
    });
    
    const pages = await convert.bulk(-1); // Convert all pages
    console.log('📄 Converted', pages.length, 'PDF pages to images');
    
    let combinedText = '';
    
    // Process each page with OCR
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      if (page.path) {
        console.log(`📄 Processing page ${i + 1} with OCR...`);
        const pageText = await performOCR(page.path);
        combinedText += pageText + '\n\n';
        
        // Clean up temporary image file
        try {
          fs.unlinkSync(page.path);
        } catch (e) {
          console.warn('Could not delete temp image:', e.message);
        }
      }
    }
    
    return combinedText.trim();
    
  } finally {
    // Clean up temporary PDF file
    try {
      if (fs.existsSync(tempPdfPath)) {
        fs.unlinkSync(tempPdfPath);
      }
    } catch (e) {
      console.warn('Could not delete temp PDF:', e.message);
    }
  }
}

/**
 * Extract text from Word documents (.doc, .docx)
 */
async function extractFromWord(buffer: Buffer): Promise<string> {
  console.log('📄 Processing Word document...');
  
  try {
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value?.trim() || '';
    
    if (result.messages && result.messages.length > 0) {
      console.warn('Word extraction warnings:', result.messages);
    }
    
    console.log('📄 Word text extracted, length:', text.length);
    return text;
  } catch (error) {
    console.error('❌ Word extraction error:', error.message);
    throw new Error(`Failed to extract text from Word document: ${error.message}`);
  }
}

/**
 * Extract text from RTF documents
 */
async function extractFromRTF(buffer: Buffer): Promise<string> {
  console.log('📄 Processing RTF document...');
  
  try {
    // Simple RTF text extraction (removing RTF commands)
    let text = buffer.toString('utf-8');
    
    // Remove RTF control sequences
    text = text.replace(/\{\*?\\[^{}]+}/g, '') // Remove control groups
               .replace(/\\[a-z]+\d*\s?/gi, '') // Remove control words
               .replace(/[{}]/g, '') // Remove braces
               .replace(/\s+/g, ' ') // Normalize whitespace
               .trim();
    
    console.log('📄 RTF text extracted, length:', text.length);
    return text;
  } catch (error) {
    console.error('❌ RTF extraction error:', error.message);
    throw new Error(`Failed to extract text from RTF document: ${error.message}`);
  }
}

/**
 * Extract text from plain text files
 */
async function extractFromText(buffer: Buffer): Promise<string> {
  console.log('📄 Processing text file...');
  
  try {
    const text = buffer.toString('utf-8').trim();
    console.log('📄 Text file read, length:', text.length);
    return text;
  } catch (error) {
    console.error('❌ Text extraction error:', error.message);
    throw new Error(`Failed to extract text from text file: ${error.message}`);
  }
}

/**
 * Extract text from ODT documents (OpenDocument Text)
 */
async function extractFromODT(buffer: Buffer): Promise<string> {
  console.log('📄 Processing ODT document...');
  
  try {
    // For now, treat as potential compressed file and extract what we can
    // This is a simplified approach - a full ODT parser would be more complex
    const text = buffer.toString('utf-8');
    
    // Basic text extraction from ODT (removing XML tags)
    const cleanText = text.replace(/<[^>]*>/g, ' ')
                          .replace(/\s+/g, ' ')
                          .trim();
    
    console.log('📄 ODT text extracted (basic), length:', cleanText.length);
    return cleanText;
  } catch (error) {
    console.error('❌ ODT extraction error:', error.message);
    throw new Error(`Failed to extract text from ODT document: ${error.message}`);
  }
}

/**
 * Extract text from image files using OCR
 */
async function extractFromImage(buffer: Buffer): Promise<string> {
  console.log('📄 Processing image with OCR...');
  
  try {
    // Optimize image for OCR
    const processedBuffer = await optimizeImageForOCR(buffer);
    
    // Perform OCR on the processed image
    const text = await performOCROnBuffer(processedBuffer);
    
    console.log('📄 Image OCR completed, text length:', text.length);
    return text;
  } catch (error) {
    console.error('❌ Image OCR error:', error.message);
    throw new Error(`Failed to extract text from image: ${error.message}`);
  }
}

/**
 * Optimize image for better OCR results
 */
async function optimizeImageForOCR(buffer: Buffer): Promise<Buffer> {
  try {
    // Use sharp for image processing instead of Jimp for better compatibility
    const processedBuffer = await sharp(buffer)
      .greyscale()
      .normalize()
      .resize(null, null, { 
        fit: 'inside',
        withoutEnlargement: false 
      })
      .png()
      .toBuffer();
    
    console.log('📄 Image optimized for OCR');
    return processedBuffer;
  } catch (error) {
    console.warn('Image optimization failed, using original:', error.message);
    return buffer;
  }
}

/**
 * Perform OCR on image file path
 */
async function performOCR(imagePath: string): Promise<string> {
  const worker = await createWorker('eng');
  
  try {
    const { data: { text } } = await worker.recognize(imagePath);
    return text?.trim() || '';
  } finally {
    await worker.terminate();
  }
}

/**
 * Perform OCR on image buffer
 */
async function performOCROnBuffer(buffer: Buffer): Promise<string> {
  const worker = await createWorker('eng');
  
  try {
    const { data: { text } } = await worker.recognize(buffer);
    return text?.trim() || '';
  } finally {
    await worker.terminate();
  }
}

/**
 * Clean and normalize extracted text
 */
function cleanExtractedText(text: string): string {
  if (!text) return '';
  
  return text
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    // Remove multiple consecutive newlines
    .replace(/\n{3,}/g, '\n\n')
    // Remove non-printable characters except newlines and tabs
    .replace(/[^\x20-\x7E\n\t]/g, '')
    // Trim
    .trim();
}
