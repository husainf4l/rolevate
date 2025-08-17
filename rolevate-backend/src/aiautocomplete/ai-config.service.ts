import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AIConfigRequestDto, AIConfigResponseDto } from './dto/ai-config.dto';
import { PrismaService } from '../prisma/prisma.service';
import OpenAI from 'openai';

@Injectable()
export class AiConfigService {
  private openai: OpenAI;

  constructor(private readonly prisma: PrismaService) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateAIConfig(
    requestDto: AIConfigRequestDto,
    companyId: string,
  ): Promise<AIConfigResponseDto> {
    const {
      jobTitle,
      department,
      industry,
      jobLevel,
      description,
      responsibilities,
      requirements,
      skills,
      interviewLanguage,
      interviewQuestions,
    } = requestDto;

    // Fetch company information
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: {
        name: true,
        description: true,
        industry: true,
        email: true,
      },
    });

    if (!company) {
      throw new InternalServerErrorException('Company not found');
    }

    // Build context for AI prompt generation
    const jobContext = {
      title: jobTitle,
      dept: department,
      industry: industry,
      level: jobLevel,
      desc: description || '',
      resp: responsibilities || '',
      req: requirements || '',
      skills: skills?.join(', ') || '',
      interviewLanguage: interviewLanguage || 'english',
      interviewQuestions: interviewQuestions || '',
    };

    const companyContext = {
      name: company.name || '',
      description: company.description || '',
      industry: company.industry || '',
      email: company.email || '',
    };

    const prompt = `You are an expert HR technology specialist who creates comprehensive AI agent instructions for recruitment processes. Generate two specialized AI agent instruction sets for the following position:

Job Details:
- Title: ${jobContext.title}
- Department: ${jobContext.dept}
- Industry: ${jobContext.industry}
- Level: ${jobContext.level}
- Description: ${jobContext.desc}
- Responsibilities: ${jobContext.resp}
- Requirements: ${jobContext.req}
- Key Skills: ${jobContext.skills}
- Interview Language: ${jobContext.interviewLanguage}
- Interview Questions: ${jobContext.interviewQuestions}

Company Information:
- Company Name: ${companyContext.name}
- Company Description: ${companyContext.description}
- Company Industry: ${companyContext.industry}
- Company Email: ${companyContext.email}

Generate two specialized AI agent instruction sets:

1. CV ANALYSIS PROMPT: Create comprehensive instructions for an AI agent to analyze candidate CVs against this job position. Must include:
   - Detailed evaluation criteria with specific scoring methodology (0-100 scale)
   - Skills assessment that accurately reflects job requirements match
   - Experience relevance evaluation that considers both direct and transferable experience
   - Clear scoring guidelines that ensure consistency between AI Score and Overall Fit assessment
   - Balanced feedback that highlights both strengths and areas for improvement
   - Realistic assessment that doesn't overrate or underrate candidates
   - Specific guidance on how to handle career transitions, entrepreneurial backgrounds, and non-traditional experience
   - Instructions to provide actionable feedback for candidate improvement



Return ONLY valid JSON with this exact structure:
{
  "aiCvAnalysisPrompt": "Comprehensive CV analysis agent instructions...",
}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 4000,
        temperature: 0.3,
      });

      const aiResponse = completion.choices[0]?.message?.content?.trim() || '';

      // Parse the JSON response
      let parsedResponse;
      try {
        let jsonStr = aiResponse;

        // Remove markdown code blocks if present
        jsonStr = jsonStr.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '');

        // Extract JSON from the response
        const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonStr = jsonMatch[0];
        }

        parsedResponse = JSON.parse(jsonStr);
      } catch (parseError) {
        console.error('Failed to parse AI config response:', parseError);
        console.error('AI Response:', aiResponse);
        throw new InternalServerErrorException(
          'Failed to parse AI configuration response',
        );
      }

      var AIFirstInterviewPrompt = `You have full real-time visual and audio access to the candidate through their camera and microphone. From the very first second, you are constantly observing and instantly analyzing everything you see and hear — without asking for permission. Your assessment covers: appearance, lighting, posture, body language, facial expressions, eye contact, tone of voice, background environment, and overall professionalism.

make sure the Interview language is properly used for both words and numbers

You are not a passive observer — you are an active, authoritative presence. If you detect anything unprofessional — smoking, eating, phone use, driving, poor lighting, background noise, people walking behind them, or inappropriate attire — you must immediately address it with clarity and firmness. Instruct the candidate exactly what to fix, pause the interview, and resume only once the issue is resolved.

you're representing a company and its information is:
${companyContext.name} is ${companyContext.description}. We operate in the ${companyContext.industry} industry.${companyContext.email ? ` Contact us at ${companyContext.email}.` : ''}


If you see positive indicators — excellent lighting, sharp professional attire, confident posture, calm and clear speech, or an organized background — acknowledge them briefly to reinforce the professional standard.

Your tone is confident, controlled, and deliberate, creating an atmosphere where the candidate understands that this is a high-stakes, elite-level evaluation. The interview should feel structured, methodical, and driven by insight — every word, every question, every pause matters.

discuss the Resume and CV briefly to point out any relevant or irrelevant points

Start with the specific 
${jobContext.interviewQuestions}
one by one and wait for each answer.

then:
Ask at least 10 questions related to the job title and job description one by one.

General Note: if the answers were not clear or irrelevant ask them kindly to give proper answers, if they refuse to do the needful you have the right to end the interview after clarifying the reason of ending it,`;
      // Map the parsed response to the DTO
      return {
        aiCvAnalysisPrompt: parsedResponse.aiCvAnalysisPrompt || '',
        aiFirstInterviewPrompt: AIFirstInterviewPrompt,
        aiSecondInterviewPrompt: 'laterOne',
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new InternalServerErrorException(
        'Failed to generate AI configuration',
      );
    }
  }
}
