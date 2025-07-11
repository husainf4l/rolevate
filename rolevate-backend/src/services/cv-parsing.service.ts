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

      // Build prompt for candidate information extraction
      const prompt = `You are an expert CV parser. Extract the following candidate information from the CV text provided below.

CV Text:
${cvText}

Extract the following information and return it as JSON:

1. First Name (required)
2. Last Name (required) 
3. Email Address (required)
4. Phone Number (optional)
5. Current Job Title (optional)
6. Current Company (optional)
7. Total Years of Experience (estimate as number, optional)
8. Top Skills (array of strings, max 10, optional)
9. Highest Education (string, optional)
10. Professional Summary (2-3 sentences, optional)

CRITICAL INSTRUCTIONS:
- Return ONLY valid JSON without any markdown formatting or additional text
- firstName and lastName are required - if not found, use "Unknown" and "Candidate"
- email is required - if not found, generate a placeholder like "unknown.candidate@placeholder.com"
- For totalExperience, estimate based on work history or experience mentioned
- For skills, extract both technical and soft skills mentioned
- Be accurate and only extract information that is clearly stated in the CV

Return the JSON in this exact format:
{
  "firstName": "string",
  "lastName": "string", 
  "email": "string",
  "phone": "string or null",
  "currentJobTitle": "string or null",
  "currentCompany": "string or null",
  "totalExperience": number or null,
  "skills": ["skill1", "skill2"] or null,
  "education": "string or null",
  "summary": "string or null"
}`;

      console.log('🤖 Sending CV parsing request to OpenAI...');
      
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a professional CV parser. Extract candidate information accurately from CV text. Return only valid JSON without any formatting.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.1, // Low temperature for consistent extraction
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
        
        // Validate required fields and provide fallbacks
        candidateInfo = {
          firstName: parsed.firstName || 'Unknown',
          lastName: parsed.lastName || 'Candidate',
          email: parsed.email || `unknown.candidate.${Date.now()}@placeholder.com`,
          phone: parsed.phone || undefined,
          currentJobTitle: parsed.currentJobTitle || undefined,
          currentCompany: parsed.currentCompany || undefined,
          totalExperience: parsed.totalExperience || undefined,
          skills: Array.isArray(parsed.skills) ? parsed.skills : undefined,
          education: parsed.education || undefined,
          summary: parsed.summary || undefined
        };

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
}