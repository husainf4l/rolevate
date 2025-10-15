import { AwsS3Service } from '../services/aws-s3.service';

export async function extractTextFromCV(cvUrl: string): Promise<string> {
  try {
    console.log('📄 Extracting text from CV URL:', cvUrl);

    // Initialize S3 service
    const awsS3Service = new AwsS3Service();

    // Download file buffer from S3
    const fileBuffer = await awsS3Service.getFileBuffer(cvUrl);
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
