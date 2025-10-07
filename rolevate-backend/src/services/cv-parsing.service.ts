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
      
      // Extract text from CV
      const cvText = await extractTextFromCV(cvUrl);
      
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
}