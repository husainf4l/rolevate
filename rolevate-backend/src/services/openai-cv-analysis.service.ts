import { Injectable, InternalServerErrorException } from '@nestjs/common';
import OpenAI from 'openai';
import { extractTextFromCV } from '../utils/cv-text-extractor';
import { CVAnalysisResultDto } from '../application/dto/application.dto';

@Injectable()
export class OpenaiCvAnalysisService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async analyzeCVWithOpenAI(
    resumeUrl: string, 
    analysisPrompt: string, 
    job: any
  ): Promise<CVAnalysisResultDto> {
    try {
      console.log('🔍 Starting CV analysis for URL:', resumeUrl);
      
      // Extract text from CV (PDF/DOC)
      const cvText = await extractTextFromCV(resumeUrl);
      
      console.log('📄 CV text extracted, length:', cvText?.length || 0);
      console.log('📄 CV text preview (first 200 chars):', cvText?.substring(0, 200) || 'No text');
      
      if (!cvText || cvText.trim().length === 0) {
        throw new Error('Could not extract text from CV');
      }

      // Build comprehensive prompt for GPT-4o
      const fullPrompt = `You are an expert HR recruiter analyzing a candidate's CV for a specific job position. 

IMPORTANT: Base your analysis ONLY on the actual CV content provided below. Do NOT use generic responses.

${analysisPrompt}

=== JOB DETAILS ===
- Title: ${job.title}
- Department: ${job.department}
- Company: ${job.company?.name || 'Unknown'}
- Location: ${job.location}
- Required Skills: ${job.skills?.join(', ') || 'Not specified'}
- Experience Level: ${job.experience || 'Not specified'}
- Education: ${job.education || 'Not specified'}
- Job Level: ${job.jobLevel || 'Not specified'}
- Work Type: ${job.workType || 'Not specified'}

=== JOB DESCRIPTION ===
${job.description || 'Not provided'}

=== JOB REQUIREMENTS ===
${job.requirements || 'Not provided'}

=== KEY RESPONSIBILITIES ===
${job.responsibilities || 'Not provided'}

=== CANDIDATE CV CONTENT ===
${cvText}

CRITICAL INSTRUCTIONS:
1. Analyze the CV content thoroughly and extract specific details about the candidate
2. Compare the candidate's actual experience, skills, and education with the job requirements
3. Provide specific examples from the CV in your analysis
4. Be objective and detailed in your assessment
5. Return ONLY the JSON response without any additional text

Return your analysis in this exact JSON format:

{
  "score": number (0-100),
  "summary": "Brief overall assessment of the candidate's fit for this position",
  "strengths": [
    "List of candidate's key strengths relevant to this role",
    "Include specific examples from their CV"
  ],
  "weaknesses": [
    "Areas where the candidate may not fully meet requirements",
    "Missing skills or experience gaps"
  ],
  "recommendations": [
    "Specific recommendations for next steps",
    "Areas to explore in interviews"
  ],
  "skillsMatch": {
    "matched": ["Skills found in CV that match job requirements"],
    "missing": ["Required skills not evident in CV"],
    "percentage": number (0-100)
  },
  "experienceMatch": {
    "relevant": boolean,
    "years": number,
    "details": "Detailed analysis of experience relevance"
  },
  "educationMatch": {
    "relevant": boolean,
    "details": "Analysis of educational background alignment"
  },
  "overallFit": "Poor|Fair|Good|Excellent"
}

Focus on being objective and providing specific examples from the CV to support your assessment.`;

      console.log('🤖 Sending request to OpenAI GPT-4o...');
      console.log('📋 Prompt length:', fullPrompt.length);
      
      // Call OpenAI GPT-4o
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert HR recruiter and CV analyst. Analyze the ACTUAL CV content provided and give specific, detailed feedback based on what you find in the CV. Do not provide generic responses. Base everything on the real CV text.'
          },
          {
            role: 'user',
            content: fullPrompt
          }
        ],
        max_tokens: 2500,
        temperature: 0.2,
      });

      const aiResponse = completion.choices[0]?.message?.content?.trim() || '';
      
      console.log('🤖 OpenAI response received, length:', aiResponse.length);
      console.log('🤖 OpenAI response preview:', aiResponse.substring(0, 300));
      
      // Parse the JSON response
      let analysisResult: CVAnalysisResultDto;
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
        
        // Validate and structure the response
        analysisResult = {
          score: Math.max(0, Math.min(100, parsed.score || 0)),
          summary: parsed.summary || 'Analysis completed',
          strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
          weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
          recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
          skillsMatch: {
            matched: Array.isArray(parsed.skillsMatch?.matched) ? parsed.skillsMatch.matched : [],
            missing: Array.isArray(parsed.skillsMatch?.missing) ? parsed.skillsMatch.missing : [],
            percentage: Math.max(0, Math.min(100, parsed.skillsMatch?.percentage || 0))
          },
          experienceMatch: {
            relevant: Boolean(parsed.experienceMatch?.relevant),
            years: parsed.experienceMatch?.years || 0,
            details: parsed.experienceMatch?.details || 'Experience analysis not available'
          },
          educationMatch: {
            relevant: Boolean(parsed.educationMatch?.relevant),
            details: parsed.educationMatch?.details || 'Education analysis not available'
          },
          overallFit: ['Poor', 'Fair', 'Good', 'Excellent'].includes(parsed.overallFit) 
            ? parsed.overallFit 
            : 'Fair'
        };
        
      } catch (parseError) {
        console.error('Failed to parse OpenAI CV analysis response:', parseError);
        console.error('AI Response:', aiResponse);
        
        // Fallback analysis if parsing fails
        analysisResult = {
          score: 50,
          summary: 'CV analysis completed but response parsing failed. Manual review recommended.',
          strengths: ['CV text extracted successfully'],
          weaknesses: ['Unable to parse detailed analysis'],
          recommendations: ['Manual review recommended', 'Verify CV content and job requirements'],
          skillsMatch: {
            matched: [],
            missing: job.skills || [],
            percentage: 0
          },
          experienceMatch: {
            relevant: false,
            years: 0,
            details: 'Could not analyze experience due to parsing error'
          },
          educationMatch: {
            relevant: false,
            details: 'Could not analyze education due to parsing error'
          },
          overallFit: 'Fair'
        };
      }

      return analysisResult;

    } catch (error) {
      console.error('OpenAI CV analysis error:', error);
      
      // Return error analysis instead of throwing
      return {
        score: 0,
        summary: `CV analysis failed: ${error.message}`,
        strengths: [],
        weaknesses: ['CV analysis could not be completed'],
        recommendations: ['Manual review required', 'Verify CV file accessibility'],
        skillsMatch: {
          matched: [],
          missing: job.skills || [],
          percentage: 0
        },
        experienceMatch: {
          relevant: false,
          years: 0,
          details: 'Analysis failed due to technical error'
        },
        educationMatch: {
          relevant: false,
          details: 'Analysis failed due to technical error'
        },
        overallFit: 'Poor'
      };
    }
  }

  async generateRecommendations(prompt: string): Promise<string> {
    try {
      console.log('🤖 Generating AI recommendations...');
      
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert career counselor and HR professional. Provide specific, actionable recommendations in a clear, organized format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.7,
      });

      const recommendations = completion.choices[0]?.message?.content?.trim();
      
      if (!recommendations) {
        return 'Unable to generate specific recommendations at this time. Please consult with your career advisor for personalized guidance.';
      }

      console.log('✅ AI recommendations generated successfully');
      return recommendations;

    } catch (error) {
      console.error('OpenAI recommendations generation error:', error);
      return 'Unable to generate recommendations due to technical issues. Please try again later or consult with a career advisor.';
    }
  }
}