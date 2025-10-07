import { Injectable } from '@nestjs/common';
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

      // Build enhanced comprehensive prompt for GPT-4o
      const fullPrompt = `You are a world-class AI recruiter with 20+ years of experience in talent acquisition and CV analysis. You have reviewed thousands of CVs across industries and have exceptional ability to match candidates to roles.

CRITICAL ANALYSIS REQUIREMENTS:
- Analyze ONLY the actual CV content provided - no assumptions or generic responses
- Provide specific evidence from the CV to support every assessment
- Be thorough, objective, and detailed in your evaluation
- Consider both explicit skills and transferable experience
- Evaluate cultural fit potential based on career progression and achievements

ANALYSIS CONTEXT:
${analysisPrompt || 'Provide comprehensive CV analysis for job matching'}

=== TARGET JOB PROFILE ===
Position: ${job.title}
Department: ${job.department || 'Not specified'}
Company: ${job.company?.name || 'Not specified'}
Location: ${job.location || 'Not specified'}
Experience Level: ${job.experience || 'Not specified'}
Job Level: ${job.jobLevel || 'Not specified'}
Work Type: ${job.workType || 'Not specified'}

Required Technical Skills: ${job.skills?.join(', ') || 'Not specified'}
Education Requirements: ${job.education || 'Not specified'}

Job Description:
${job.description || 'Not provided'}

Key Requirements:
${job.requirements || 'Not provided'}

Primary Responsibilities:
${job.responsibilities || 'Not provided'}

=== CANDIDATE CV ANALYSIS ===
CV Text Content:
${cvText}

ANALYSIS INSTRUCTIONS:
1. **Skills Assessment**: Match candidate's technical and soft skills against job requirements
2. **Experience Evaluation**: Analyze relevance, depth, and progression of work experience
3. **Education Analysis**: Compare educational background with job requirements
4. **Achievement Recognition**: Identify notable accomplishments and their relevance
5. **Growth Potential**: Assess candidate's learning ability and career trajectory
6. **Cultural Fit Indicators**: Evaluate based on career choices and achievements
7. **Risk Assessment**: Identify potential concerns or gaps

SCORING METHODOLOGY:
- 90-100: Exceptional fit - rare find, immediate hire consideration
- 80-89: Excellent fit - strong candidate, likely success
- 70-79: Good fit - solid candidate with minor gaps
- 60-69: Moderate fit - potential with development needed  
- 50-59: Fair fit - significant gaps or concerns
- 0-49: Poor fit - not suitable for this role

Return your analysis as a valid JSON object ONLY (no markdown, no additional text):

{
  "score": number (0-100, based on methodology above),
  "summary": "2-3 sentence executive summary of candidate's overall fit and key differentiators",
  "strengths": [
    "Specific strength with evidence from CV",
    "Another strength with quantified achievement", 
    "Technical competency with examples"
  ],
  "weaknesses": [
    "Specific gap or concern with context",
    "Missing requirement with impact assessment",
    "Development area with recommendation"
  ],
  "recommendations": [
    "Immediate next step or interview focus area",
    "Specific question to ask in interview",
    "Skill assessment or test recommendation"
  ],
  "skillsMatch": {
    "matched": ["Explicitly mentioned skill from CV", "Inferred skill with evidence"],
    "missing": ["Required skill not found in CV", "Another gap"],
    "percentage": number (0-100, based on matched vs required skills)
  },
  "experienceMatch": {
    "relevant": boolean (true if experience directly applies to role),
    "years": number (total relevant professional experience),
    "details": "Detailed analysis of how experience aligns with role requirements, including specific examples"
  },
  "educationMatch": {
    "relevant": boolean (true if education meets or exceeds requirements),
    "details": "Analysis of educational qualifications, certifications, and continuous learning evidence"
  },
  "overallFit": "Poor|Fair|Good|Excellent"
}`;

      console.log('🤖 Sending request to OpenAI GPT-4o...');
      console.log('📋 Prompt length:', fullPrompt.length);
      
      // Call OpenAI GPT-4o with optimized parameters
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an elite AI recruiter with exceptional analytical capabilities. You specialize in:
- Precise CV analysis with evidence-based assessments
- Accurate skill matching and gap identification  
- Professional experience evaluation and relevance scoring
- Educational qualification analysis
- Cultural and role fit prediction
- Risk assessment and hiring recommendations

Your analyses are renowned for accuracy, specificity, and actionable insights. You ALWAYS provide concrete evidence from the CV to support your evaluations and never make assumptions beyond what is explicitly or reasonably implied in the document.`
          },
          {
            role: 'user',
            content: fullPrompt
          }
        ],
        max_tokens: 3000, // Increased for more detailed analysis
        temperature: 0.1, // Very low for consistent, analytical responses
        top_p: 0.1, // Focused sampling for precision
        presence_penalty: 0.1, // Slight penalty to avoid repetition
        frequency_penalty: 0.1, // Encourage varied vocabulary
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