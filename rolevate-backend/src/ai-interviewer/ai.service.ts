import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { ChatMessage } from './interfaces/ai-interviewer.interfaces';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    
    if (!apiKey) {
      this.logger.error('OpenAI API key is missing. Please check your .env file.');
    }
    
    this.openai = new OpenAI({
      apiKey,
    });
    
    this.logger.log('AI service initialized');
  }

  /**
   * Generate a response from OpenAI based on conversation history
   * @param messages Array of conversation messages
   * @returns Promise resolving to generated response text
   */
  async generateResponse(messages: ChatMessage[]): Promise<string> {
    try {
      // Handle messages based on role to ensure proper typing for OpenAI API
      const formattedMessages = messages.map(msg => {
        if (msg.role === 'function') {
          return {
            role: msg.role,
            content: msg.content,
            name: msg.name || 'function' // Provide default name for function messages
          };
        } else {
          return {
            role: msg.role,
            content: msg.content,
            ...(msg.name ? { name: msg.name } : {})
          };
        }
      });

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 500,
      });

      return response.choices[0].message.content || '';
    } catch (error) {
      this.logger.error(`Error generating response: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Generate interview questions based on job description and context
   * @param jobDescription Description of the job being interviewed for
   * @param context Additional context for question generation
   * @param count Number of questions to generate
   * @returns Promise resolving to array of generated questions
   */
  async generateInterviewQuestions(
    jobDescription: string,
    context = '',
    count = 5,
  ): Promise<string[]> {
    try {
      const prompt = `
        You are tasked with generating interview questions for the following job:
        
        Job Description: ${jobDescription}
        
        Additional Context: ${context}
        
        Generate questions that will assess both technical skills and behavioral fit.
        Return only the questions as a numbered list, without any additional text.
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      });

      const responseText = response.choices[0].message.content;
      
      // Handle null response
      if (!responseText) {
        this.logger.warn('OpenAI returned null response for question generation');
        return [];
      }

      const questions = responseText
        .split('\n')
        .filter(line => /^\d+\./.test(line.trim()))
        .map(line => line.replace(/^\d+\.\s*/, '').trim());

      return questions.slice(0, count);
    } catch (error) {
      this.logger.error(`Error generating questions: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Analyze a candidate's response to a question
   * @param question The interview question
   * @param response The candidate's response
   * @returns Promise resolving to analysis of the response
   */
  async analyzeResponse(question: string, response: string): Promise<string> {
    try {
      const prompt = `
        You are an expert at evaluating interview responses.
        
        Question: ${question}
        
        Candidate's Response: ${response}
        
        Analyze the candidate's response. Consider:
        1. Relevance to the question
        2. Technical accuracy (if applicable)
        3. Clarity and communication quality
        4. Depth of understanding
        
        Provide a brief, constructive analysis that highlights strengths and areas for improvement.
      `;

      const result = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      });

      return result.choices[0].message.content || '';
    } catch (error) {
      this.logger.error(`Error analyzing response: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Generate a follow-up question based on the previous question and response
   * @param question The previous interview question
   * @param response The candidate's response
   * @returns Promise resolving to follow-up question
   */
  async generateFollowUp(question: string, response: string): Promise<string> {
    try {
      const prompt = `
        You are an expert technical interviewer conducting an interview.
        
        Previous Question: ${question}
        
        Candidate's Response: ${response}
        
        Based on the candidate's response, generate a meaningful follow-up question that:
        1. Probes deeper into the topic
        2. Challenges the candidate to think critically
        3. Explores their understanding more thoroughly
        
        Return only the follow-up question without any additional text.
      `;

      const result = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      });

      return result.choices[0].message.content || '';
    } catch (error) {
      this.logger.error(`Error generating follow-up: ${error.message}`, error.stack);
      throw error;
    }
  }
}
