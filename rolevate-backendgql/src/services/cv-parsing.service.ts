import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { extractTextFromCV } from '../utils/cv-text-extractor';

export interface CandidateInfoFromCV {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  currentJobTitle?: string;
  currentCompany?: string;
  totalExperience?: number;
  skills?: string[];
  education?: string;
  summary?: string;
}

@Injectable()
export class CvParsingService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async extractCandidateInfoFromCV(cvUrl: string): Promise<CandidateInfoFromCV> {
    try {
      console.log('🔍 Extracting candidate information from CV:', cvUrl);
      
      // Use S3 service to get file buffer directly (more reliable than presigned URLs)
      const awsS3Service = new (await import('./aws-s3.service')).AwsS3Service();
      console.log('📥 Downloading CV file buffer directly from S3...');
      
      const fileBuffer = await awsS3Service.getFileBuffer(cvUrl);
      console.log('✅ CV file buffer downloaded, size:', fileBuffer.length, 'bytes');
      
      // Extract text from the buffer directly
      const cvText = await this.extractTextFromBuffer(fileBuffer, cvUrl);
      
      if (!cvText || cvText.trim().length === 0) {
        throw new Error('Could not extract text from CV');
      }

      // Build enhanced prompt for candidate information extraction
      const prompt = `You are a world-class AI CV parser with expertise in extracting structured data from resumes and CVs. Your task is to analyze the CV text below and extract key candidate information with high accuracy.

CV Text to Analyze:
${cvText}

EXTRACTION REQUIREMENTS:

Extract the following information and return it as a valid JSON object:

1. PERSONAL INFORMATION:
   - firstName (string, required): Extract the candidate's first/given name
   - lastName (string, required): Extract the candidate's last/family name  
   - email (string, required): Find email address or create placeholder
   - phone (string, optional): Extract phone/mobile number with country code if available

2. PROFESSIONAL INFORMATION:
   - currentJobTitle (string, optional): Most recent job title or position
   - currentCompany (string, optional): Current or most recent employer
   - totalExperience (number, optional): Total years of professional experience (estimate based on work history dates)

3. SKILLS AND QUALIFICATIONS:
   - skills (array of strings, optional): Extract 5-15 relevant skills including:
     * Technical skills (programming languages, tools, software)
     * Professional skills (project management, leadership, etc.)
     * Industry-specific skills
     * Certifications and qualifications
   - education (string, optional): Highest degree, institution, and field of study

4. SUMMARY:
   - summary (string, optional): Create a 2-3 sentence professional summary based on the CV content

QUALITY GUIDELINES:
- Be precise and extract only information that is clearly stated
- For names: Look for patterns like "Name:", headers, or signature areas
- For experience: Calculate years between job start/end dates when available
- For skills: Include both explicitly listed skills and those implied by job descriptions
- For education: Format as "Degree in Field from Institution (Year)"
- Use proper title case for names and job titles
- If information is unclear or missing, use null instead of guessing

FALLBACK RULES:
- If no name found: use "Unknown" for firstName, "Candidate" for lastName
- If no email found: generate "unknown.candidate.${Date.now()}@placeholder.com"
- If no clear experience: estimate based on job descriptions and career progression
- If no skills found: extract keywords from job descriptions

OUTPUT FORMAT:
Return ONLY a valid JSON object with no additional text, markdown, or formatting:

{
  "firstName": "string",
  "lastName": "string", 
  "email": "string",
  "phone": "string or null",
  "currentJobTitle": "string or null",
  "currentCompany": "string or null",
  "totalExperience": number or null,
  "skills": ["skill1", "skill2", "skill3"] or null,
  "education": "string or null",
  "summary": "string or null"
}`;

      console.log('🤖 Sending enhanced CV parsing request to OpenAI...');
      
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert AI CV parser specializing in accurate information extraction. You have processed thousands of resumes and understand various CV formats, layouts, and languages. Extract structured data with high precision and return only valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1500, // Increased for more detailed extraction
        temperature: 0.05, // Very low temperature for maximum consistency
        top_p: 0.1, // Focused sampling for better accuracy
      });

      const aiResponse = completion.choices[0]?.message?.content?.trim() || '';
      
      console.log('🤖 CV parsing response received, length:', aiResponse.length);
      console.log('🤖 Response preview:', aiResponse.substring(0, 200));

      // Parse the JSON response
      let candidateInfo: CandidateInfoFromCV;
      try {
        let jsonStr = aiResponse;
        
        // Remove markdown code blocks if present
        jsonStr = jsonStr.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '');
        
        // Extract JSON from the response
        const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonStr = jsonMatch[0];
        }
        
        const parsed = JSON.parse(jsonStr);
        
        // Validate and clean the parsed data
        candidateInfo = this.validateAndCleanCandidateInfo(parsed, cvText);

        console.log('✅ Candidate info extracted:', {
          name: `${candidateInfo.firstName} ${candidateInfo.lastName}`,
          email: candidateInfo.email,
          title: candidateInfo.currentJobTitle,
          experience: candidateInfo.totalExperience
        });

      } catch (parseError) {
        console.error('Failed to parse CV extraction response:', parseError);
        console.error('AI Response:', aiResponse);
        
        // Fallback candidate info
        candidateInfo = {
          firstName: 'Unknown',
          lastName: 'Candidate',
          email: `unknown.candidate.${Date.now()}@placeholder.com`,
          phone: undefined,
          currentJobTitle: undefined,
          currentCompany: undefined,
          totalExperience: undefined,
          skills: undefined,
          education: undefined,
          summary: 'CV information could not be parsed automatically'
        };
      }

      return candidateInfo;

    } catch (error) {
      console.error('CV parsing error:', error);
      
      // Return minimal candidate info on error
      return {
        firstName: 'Unknown',
        lastName: 'Candidate',
        email: `unknown.candidate.${Date.now()}@placeholder.com`,
        phone: undefined,
        currentJobTitle: undefined,
        currentCompany: undefined,
        totalExperience: undefined,
        skills: undefined,
        education: undefined,
        summary: `CV parsing failed: ${error.message}`
      };
    }
  }

  /**
   * Validate and clean extracted candidate information
   */
  private validateAndCleanCandidateInfo(parsed: any, originalCvText: string): CandidateInfoFromCV {
    // Validate and sanitize names
    const firstName = this.sanitizeName(parsed.firstName) || 'Unknown';
    const lastName = this.sanitizeName(parsed.lastName) || 'Candidate';
    
    // Validate email format
    let email = parsed.email;
    if (!email || !this.isValidEmail(email)) {
      email = `unknown.candidate.${Date.now()}@placeholder.com`;
    }
    
    // Validate and format phone number
    let phone = parsed.phone;
    if (phone) {
      phone = this.cleanPhoneNumber(phone);
      if (!phone || phone.length < 7) {
        phone = undefined;
      }
    }
    
    // Validate experience (should be reasonable number)
    let totalExperience = parsed.totalExperience;
    if (totalExperience !== null && totalExperience !== undefined) {
      totalExperience = Math.max(0, Math.min(60, Number(totalExperience))); // 0-60 years range
      if (isNaN(totalExperience)) {
        totalExperience = undefined;
      }
    }
    
    // Validate and clean skills array
    let skills = parsed.skills;
    if (Array.isArray(skills)) {
      skills = skills
        .filter(skill => typeof skill === 'string' && skill.trim().length > 1)
        .map(skill => skill.trim())
        .slice(0, 20); // Limit to 20 skills max
      
      if (skills.length === 0) {
        skills = undefined;
      }
    } else {
      skills = undefined;
    }
    
    // Clean job title and company
    const currentJobTitle = parsed.currentJobTitle ? parsed.currentJobTitle.trim() : undefined;
    const currentCompany = parsed.currentCompany ? parsed.currentCompany.trim() : undefined;
    
    // Clean education
    const education = parsed.education ? parsed.education.trim() : undefined;
    
    // Clean and validate summary
    let summary = parsed.summary ? parsed.summary.trim() : undefined;
    if (summary && summary.length > 500) {
      summary = summary.substring(0, 500) + '...';
    }
    
    // Data quality scoring
    const qualityScore = this.calculateExtractionQuality({
      firstName, lastName, email, phone, currentJobTitle, 
      currentCompany, totalExperience, skills, education, summary
    }, originalCvText);
    
    console.log('📊 CV extraction quality score:', qualityScore);
    
    return {
      firstName,
      lastName,
      email,
      phone,
      currentJobTitle,
      currentCompany,
      totalExperience,
      skills,
      education,
      summary
    };
  }

  /**
   * Sanitize name fields
   */
  private sanitizeName(name: string): string {
    if (!name || typeof name !== 'string') return '';
    
    return name
      .trim()
      .replace(/[^a-zA-Z\s'-]/g, '') // Only allow letters, spaces, hyphens, apostrophes
      .replace(/\s+/g, ' ') // Normalize whitespace
      .slice(0, 50); // Reasonable length limit
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    if (!email || typeof email !== 'string') return false;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254; // RFC 5321 limit
  }

  /**
   * Clean and format phone number
   */
  private cleanPhoneNumber(phone: string): string {
    if (!phone || typeof phone !== 'string') return '';
    
    // Remove all non-digit characters except + at the beginning
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    // Ensure + only appears at the beginning
    if (cleaned.includes('+')) {
      const parts = cleaned.split('+');
      cleaned = '+' + parts.join('');
    }
    
    return cleaned.slice(0, 20); // Reasonable length limit
  }

  /**
   * Calculate extraction quality score (0-100)
   */
  private calculateExtractionQuality(info: CandidateInfoFromCV, originalText: string): number {
    let score = 0;
    const maxScore = 100;
    
    // Name quality (20 points)
    if (info.firstName && info.firstName !== 'Unknown') score += 10;
    if (info.lastName && info.lastName !== 'Candidate') score += 10;
    
    // Contact quality (20 points)
    if (info.email && !info.email.includes('placeholder.com')) score += 10;
    if (info.phone) score += 10;
    
    // Professional info quality (30 points)
    if (info.currentJobTitle) score += 10;
    if (info.currentCompany) score += 10;
    if (info.totalExperience !== null && info.totalExperience !== undefined) score += 10;
    
    // Skills and education quality (20 points)
    if (info.skills && info.skills.length > 0) score += 10;
    if (info.education) score += 10;
    
    // Summary quality (10 points)
    if (info.summary && info.summary.length > 20) score += 10;
    
    return Math.min(score, maxScore);
  }

  /**
   * Extract text from file buffer based on file extension
   */
  private async extractTextFromBuffer(buffer: Buffer, fileUrl: string): Promise<string> {
    // Extract file extension from URL
    const urlParts = fileUrl.split('.');
    const ext = urlParts.length > 1 ? '.' + urlParts[urlParts.length - 1].toLowerCase().split('?')[0] : '.pdf';
    
    console.log('📎 Processing file with extension:', ext);
    
    // Determine file type and extract text accordingly
    if (ext === '.pdf') {
      return await this.extractFromPDF(buffer);
    } else if (['.doc', '.docx'].includes(ext)) {
      return await this.extractFromWord(buffer);
    } else if (ext === '.rtf') {
      return await this.extractFromRTF(buffer);
    } else if (ext === '.txt') {
      return await this.extractFromText(buffer);
    } else if (ext === '.odt') {
      return await this.extractFromODT(buffer);
    } else if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.tif', '.webp'].includes(ext)) {
      return await this.extractFromImage(buffer);
    } else {
      throw new Error(`Unsupported file type: ${ext}`);
    }
  }

  /**
   * Extract text from PDF buffer
   */
  private async extractFromPDF(buffer: Buffer): Promise<string> {
    console.log('📄 Processing PDF document...');
    
    try {
      // First, try standard PDF text extraction
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(buffer);
      let text = data.text?.trim() || '';
      
      console.log('📄 PDF text extraction result:', text.length, 'characters');
      
      // If very little text was extracted, the PDF might be scanned (images)
      if (text.length < 50) {
        console.log('📄 Low text content detected, trying OCR on PDF pages...');
        text = await this.extractFromScannedPDF(buffer);
      }
      
      return text;
    } catch (error) {
      console.error('❌ PDF extraction error:', error.message);
      // Fallback to OCR if regular PDF parsing fails
      console.log('📄 Falling back to OCR for PDF...');
      return await this.extractFromScannedPDF(buffer);
    }
  }

  /**
   * Extract text from scanned PDF using OCR
   */
  private async extractFromScannedPDF(buffer: Buffer): Promise<string> {
    console.log('📄 Converting PDF pages to images for OCR...');
    
    const tempDir = require('os').tmpdir();
    const tempPdfPath = require('path').join(tempDir, `cv-${Date.now()}.pdf`);
    
    try {
      // Write PDF to temporary file
      require('fs').writeFileSync(tempPdfPath, buffer);
      
      // Convert PDF pages to images
      const pdf2pic = (await import('pdf2pic')).default;
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
          const pageText = await this.performOCR(page.path);
          combinedText += pageText + '\n\n';
          
          // Clean up temporary image file
          try {
            require('fs').unlinkSync(page.path);
          } catch (e) {
            console.warn('Could not delete temp image:', e.message);
          }
        }
      }
      
      return combinedText.trim();
      
    } finally {
      // Clean up temporary PDF file
      try {
        if (require('fs').existsSync(tempPdfPath)) {
          require('fs').unlinkSync(tempPdfPath);
        }
      } catch (e) {
        console.warn('Could not delete temp PDF:', e.message);
      }
    }
  }

  /**
   * Extract text from Word documents (.doc, .docx)
   */
  private async extractFromWord(buffer: Buffer): Promise<string> {
    console.log('📄 Processing Word document...');
    
    try {
      const mammoth = await import('mammoth');
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
  private async extractFromRTF(buffer: Buffer): Promise<string> {
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
  private async extractFromText(buffer: Buffer): Promise<string> {
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
  private async extractFromODT(buffer: Buffer): Promise<string> {
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
  private async extractFromImage(buffer: Buffer): Promise<string> {
    console.log('📄 Processing image with OCR...');
    
    try {
      // Optimize image for OCR
      const processedBuffer = await this.optimizeImageForOCR(buffer);
      
      // Perform OCR on the processed image
      const text = await this.performOCROnBuffer(processedBuffer);
      
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
  private async optimizeImageForOCR(buffer: Buffer): Promise<Buffer> {
    try {
      // Use sharp for image processing
      const sharp = await import('sharp');
      const processedBuffer = await sharp.default(buffer)
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
  private async performOCR(imagePath: string): Promise<string> {
    const { createWorker } = await import('tesseract.js');
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
  private async performOCROnBuffer(buffer: Buffer): Promise<string> {
    const { createWorker } = await import('tesseract.js');
    const worker = await createWorker('eng');
    
    try {
      const { data: { text } } = await worker.recognize(buffer);
      return text?.trim() || '';
    } finally {
      await worker.terminate();
    }
  }
}