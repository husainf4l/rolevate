import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CompanyDescriptionRequestDto, CompanyDescriptionResponseDto } from './dto/company-description.dto';
import OpenAI from 'openai';

@Injectable()
export class AiautocompleteService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  
  async generateCompanyDescription(requestDto: CompanyDescriptionRequestDto): Promise<CompanyDescriptionResponseDto> {
    const { industry, location, country, numberOfEmployees, currentDescription } = requestDto;
    
    const contextParts: string[] = [];
    
    if (industry) contextParts.push(`Industry: ${industry}`);
    if (location && country) contextParts.push(`Location: ${location}, ${country}`);
    else if (country) contextParts.push(`Country: ${country}`);
    else if (location) contextParts.push(`Location: ${location}`);
    if (numberOfEmployees) contextParts.push(`Employees: ${numberOfEmployees}`);
    if (currentDescription) contextParts.push(`Current: ${currentDescription}`);
    
    const context = contextParts.join('\n');
    
    const prompt = `Generate a concise and professional company description (max 400 characters) based on the following details:\n\n${context}\n\nGuidelines:\n- Use a formal and engaging tone.\n- Highlight the company's value proposition and unique strengths.\n- Include impactful phrases that convey leadership, innovation, and commitment to excellence.\n- Ensure clarity and precision in the description.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
        temperature: 0.7,
      });

      const generatedDescription = completion.choices[0]?.message?.content?.trim() || '';
      
      const truncatedDescription = generatedDescription.length > 400 
        ? generatedDescription.substring(0, 400) // Ensure exactly 400 characters
        : generatedDescription;

      return {
        generatedDescription: truncatedDescription
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new InternalServerErrorException('Failed to generate company description');
    }
  }
}