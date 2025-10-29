import { AwsS3Service } from '../services/aws-s3.service';

async function downloadFromPresignedUrl(url: string): Promise<Buffer> {
  try {
    const https = require('https');
    const http = require('http');

    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https:') ? https : http;
      
      protocol.get(url, (response: any) => {
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
          return;
        }

        const chunks: Buffer[] = [];
        
        response.on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        });
        
        response.on('end', () => {
          const buffer = Buffer.concat(chunks);
          console.log('📥 Downloaded file via presigned URL, size:', buffer.length, 'bytes');
          resolve(buffer);
        });
        
        response.on('error', (error: Error) => {
          reject(error);
        });
      }).on('error', (error: Error) => {
        reject(error);
      });
    });
  } catch (error) {
    console.error('❌ Failed to download from presigned URL:', error);
    throw error;
  }
}

export async function extractTextFromCV(cvUrl: string): Promise<string> {
  try {
    console.log('📄 Extracting text from CV URL:', cvUrl);

    // Check if it's a presigned URL or direct S3 URL
    const awsS3Service = new AwsS3Service();
    let fileBuffer: Buffer;

    if (cvUrl.includes('X-Amz-Algorithm=AWS4-HMAC-SHA256') || cvUrl.includes('X-Amz-Signature')) {
      // This is a presigned URL - download via HTTP
      console.log('🔗 Detected presigned URL, downloading via HTTP...');
      fileBuffer = await downloadFromPresignedUrl(cvUrl);
    } else {
      // This is a direct S3 URL - use S3 SDK (may fail with restricted IAM)
      console.log('📥 Direct S3 URL detected, using S3 SDK...');
      fileBuffer = await awsS3Service.getFileBuffer(cvUrl);
    }

    console.log('✅ CV file buffer downloaded, size:', fileBuffer.length, 'bytes');

    // Determine file type and extract text
    const fileExtension = getFileExtension(cvUrl);
    console.log('📎 Detected file extension:', fileExtension);

    switch (fileExtension.toLowerCase()) {
      case 'pdf':
        return await extractFromPDF(fileBuffer);
      case 'docx':
      case 'doc':
        return await extractFromWord(fileBuffer);
      case 'txt':
        return extractFromText(fileBuffer);
      default:
        console.warn('⚠️ Unsupported file type for text extraction:', fileExtension);
        return '';
    }
  } catch (error) {
    console.error('❌ Error extracting text from CV:', error);
    return '';
  }
}

function getFileExtension(url: string): string {
  const urlParts = url.split('.');
  return urlParts.length > 1 ? urlParts[urlParts.length - 1].split('?')[0] : '';
}

async function extractFromPDF(buffer: Buffer): Promise<string> {
  try {
    const pdfParse = require('pdf-parse');
    const data = await pdfParse(buffer);
    return data.text?.trim() || '';
  } catch (error) {
    console.error('❌ PDF extraction error:', error);
    return '';
  }
}

async function extractFromWord(buffer: Buffer): Promise<string> {
  try {
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ buffer });
    return result.value?.trim() || '';
  } catch (error) {
    console.error('❌ Word extraction error:', error);
    return '';
  }
}

function extractFromText(buffer: Buffer): string {
  try {
    return buffer.toString('utf-8').trim();
  } catch (error) {
    console.error('❌ Text extraction error:', error);
    return '';
  }
}
