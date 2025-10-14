import { Injectable, Logger } from '@nestjs/common';
import { OpenAI } from 'openai';
import { PdfParser } from './parsers/pdf_parser';
import { TextParser } from './parsers/text_parser';
import { TemplateService } from '../services/template.service';

export interface CVData {
  fullName: string;
  jobTitle?: string;
  contact: {
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    website?: string;
  };
  summary?: string;
  experience: Array<{
    jobTitle: string;
    company: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    isCurrent: boolean;
    description?: string;
    achievements: string[];
    technologies: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    gpa?: string;
  }>;
  skills: string[];
  skillCategories?: Array<{
    category: string;
    skills: string[];
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    issueDate?: string;
    credentialId?: string;
  }>;
  projects?: Array<{
    name: string;
    description: string;
    technologies: string[];
    url?: string;
  }>;
  languages?: Array<{
    language: string;
    proficiency: string;
  }>;
}

@Injectable()
export class CVFillerAgent {
  private readonly logger = new Logger(CVFillerAgent.name);
  private openai: OpenAI;
  private pdfParser: PdfParser;
  private textParser: TextParser;
  private templateService: TemplateService;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.pdfParser = new PdfParser();
    this.textParser = new TextParser();
    this.templateService = new TemplateService();
  }

  /**
   * Extract structured CV data from file
   */
  async extractCVData(
    fileBuffer: Buffer,
    filename: string,
  ): Promise<CVData> {
    this.logger.log(`Extracting CV data from: ${filename}`);

    let textContent: string;

    // Parse file based on type
    if (filename.toLowerCase().endsWith('.pdf')) {
      textContent = await this.pdfParser.parse(fileBuffer);
    } else if (filename.toLowerCase().endsWith('.txt')) {
      textContent = fileBuffer.toString('utf-8');
    } else if (filename.toLowerCase().endsWith('.docx')) {
      textContent = await this.textParser.parseDocx(fileBuffer);
    } else {
      throw new Error('Unsupported file format');
    }

    // Extract structured data using OpenAI
    const cvData = await this.extractWithAI(textContent);

    this.logger.log(`CV data extracted for: ${cvData.fullName}`);
    return cvData;
  }

  /**
   * Extract structured data using OpenAI GPT-4
   */
  private async extractWithAI(cvText: string): Promise<CVData> {
    const prompt = `You are an expert CV parser. Extract all relevant information from the following CV text and structure it as JSON.

**INSTRUCTIONS:**
- Extract ALL information present in the CV
- For dates, use "YYYY-MM" format when possible
- If employment is current, set isCurrent to true and endDate to "Present"
- Separate achievements and responsibilities into bullet points
- Identify technologies/skills mentioned in job descriptions
- Parse education details including degrees, institutions, and dates
- Extract certifications, projects, languages, and any other sections
- If a field is not present, use null or empty array

**CV TEXT:**
${cvText}

Return ONLY a valid JSON object matching this structure:
{
  "fullName": "string",
  "jobTitle": "string | null",
  "contact": {
    "email": "string | null",
    "phone": "string | null",
    "location": "string | null",
    "linkedin": "string | null",
    "website": "string | null"
  },
  "summary": "string | null",
  "experience": [
    {
      "jobTitle": "string",
      "company": "string",
      "location": "string | null",
      "startDate": "string | null",
      "endDate": "string | null",
      "isCurrent": boolean,
      "description": "string | null",
      "achievements": ["string"],
      "technologies": ["string"]
    }
  ],
  "education": [...],
  "skills": ["string"],
  "skillCategories": [...],
  "certifications": [...],
  "projects": [...],
  "languages": [...]
}`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert CV parser. Return only valid JSON, no markdown formatting.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0].message.content;
      const cvData = JSON.parse(content);

      return cvData as CVData;
    } catch (error) {
      this.logger.error('Error extracting CV with AI:', error);
      throw new Error('Failed to extract CV data');
    }
  }

  /**
   * Fill CV template with extracted data
   */
  async fillTemplate(
    cvData: CVData,
    templateName: string = 'modern_cv',
    outputFormat: 'pdf' | 'docx' = 'pdf',
  ): Promise<Buffer> {
    this.logger.log(
      `Filling template ${templateName} for ${cvData.fullName}`,
    );

    if (outputFormat === 'pdf') {
      return await this.templateService.generatePDF(cvData, templateName);
    } else {
      return await this.templateService.generateDOCX(cvData, templateName);
    }
  }

  /**
   * Complete pipeline: extract + fill + export
   */
  async processCV(
    fileBuffer: Buffer,
    filename: string,
    templateName: string = 'modern_cv',
    outputFormat: 'pdf' | 'docx' = 'pdf',
  ): Promise<{ cvData: CVData; fileBuffer: Buffer; filename: string }> {
    this.logger.log(`Processing CV: ${filename}`);

    // Step 1: Extract data
    const cvData = await this.extractCVData(fileBuffer, filename);

    // Step 2: Fill template
    const outputBuffer = await this.fillTemplate(
      cvData,
      templateName,
      outputFormat,
    );

    // Step 3: Generate output filename
    const outputFilename = `${cvData.fullName.replace(/ /g, '_')}_CV.${outputFormat}`;

    this.logger.log(`CV processed successfully: ${outputFilename}`);

    return {
      cvData,
      fileBuffer: outputBuffer,
      filename: outputFilename,
    };
  }

  /**
   * Enhance CV data with AI improvements
   */
  async enhanceCVData(cvData: CVData): Promise<CVData> {
    this.logger.log(`Enhancing CV data for: ${cvData.fullName}`);

    const prompt = `You are a professional CV writer. Review and enhance the following CV data by:
- Improving job descriptions and achievements with action verbs
- Ensuring consistency in formatting
- Making bullet points clear and impactful
- Maintaining professional tone

Original CV Data:
${JSON.stringify(cvData, null, 2)}

Return the enhanced CV data in the same JSON structure.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a professional CV writer. Return only valid JSON.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });

      const enhanced = JSON.parse(response.choices[0].message.content);
      this.logger.log('CV data enhanced successfully');
      return enhanced as CVData;
    } catch (error) {
      this.logger.warn('Enhancement failed, returning original data');
      return cvData;
    }
  }
}
