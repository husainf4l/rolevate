import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CompanyDescriptionRequestDto, CompanyDescriptionResponseDto } from './dto/company-description.dto';
import { SalaryRecommendationRequestDto, SalaryRecommendationResponseDto, SalaryRange, SalarySource, JobRequirements } from './dto/salary-recommendation.dto';
import { RequirementsPolishRequestDto, RequirementsPolishResponseDto } from './dto/requirements-polish.dto';
import { JobTitleRewriteRequestDto, JobTitleRewriteResponseDto } from './dto/job-title-rewrite.dto';
import { BenefitsPolishRequestDto, BenefitsPolishResponseDto } from './dto/benefits-polish.dto';
import { ResponsibilitiesPolishRequestDto, ResponsibilitiesPolishResponseDto } from './dto/responsibilities-polish.dto';
import { AboutCompanyPolishRequestDto, AboutCompanyPolishResponseDto } from './dto/about-company-polish.dto';
import { AIConfigRequestDto, AIConfigResponseDto } from './dto/ai-config.dto';
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

  async generateSalaryRecommendation(requestDto: SalaryRecommendationRequestDto): Promise<SalaryRecommendationResponseDto> {
    const { jobTitle, department, industry, employeeType, jobLevel, workType, location, country } = requestDto;
    
    // Build comprehensive context for AI
    const contextParts: string[] = [
      `Job Title: ${jobTitle}`,
      `Location: ${location}${country ? `, ${country}` : ''}`,
    ];
    
    if (department) contextParts.push(`Department: ${department}`);
    if (industry) contextParts.push(`Industry: ${industry}`);
    if (employeeType) contextParts.push(`Employee Type: ${employeeType}`);
    if (jobLevel) contextParts.push(`Job Level: ${jobLevel}`);
    if (workType) contextParts.push(`Work Type: ${workType}`);
    
    const context = contextParts.join('\n');
    
    const prompt = `You are a comprehensive job analysis expert. Provide a detailed job analysis for the following position:

${context}

Please provide a comprehensive analysis including:

1. Salary range (minimum and maximum) in local currency
2. Average/median salary
3. Currency code (USD, EUR, GBP, AED, SAR, etc.)
4. Detailed job description (2-3 paragraphs)
5. Short description (1-2 sentences, max 200 characters, perfect for job listing previews)
6. Key responsibilities section - a complete, well-formatted section with title and 6-10 main responsibilities in bullet points
7. Requirements & qualifications (5-8 bullet points)
8. Experience level as a simple year range ONLY (e.g., "2-4 years", "5-7 years", "1-3 years")
9. Education requirements (3-5 options)
10. Required skills (8-12 technical and soft skills)
11. Benefits & perks (5-8 common benefits for this role)
12. At least 3 detailed and credible sources with full URLs, methodology explanation, data sample size, and regional specificity
13. 3-5 key insights about this role

IMPORTANT for Key Responsibilities: Format as a complete section starting with "Key Responsibilities:" title followed by 6-10 bullet points (•) with detailed descriptions of main duties and responsibilities.

IMPORTANT for Short Description: Must be concise, engaging, and capture the essence of the role in 1-2 sentences. Keep it under 200 characters.

IMPORTANT for sources: Provide realistic and detailed source information including:
- Full website URLs (e.g., https://www.glassdoor.com/Salaries/sales-representative-salary-SRCH_KO0,18.htm)
- Clear methodology (e.g., "Based on 1,200+ employee salary reports", "Government labor bureau statistics", "Industry survey of 300+ companies")
- Specific data points count (realistic numbers like 250, 500, 1000+)
- Regional specificity (e.g., "Middle East region", "Jordan market data", "Gulf region")
- Individual salary range for each source (showing what each source reports separately)

Each source should have its own salary range that contributes to the overall recommendation. The final salary range should be a calculated average/consensus of all sources.

Consider factors like:
- Local cost of living and market conditions
- Industry standards and trends
- Work type impact on compensation (remote/hybrid/on-site)
- Experience level requirements
- Current market trends (2024-2025)
- Department-specific requirements

CRITICAL: Return ONLY valid JSON without any markdown formatting, code blocks, or additional text. Do not use backtick code blocks.

Format your response as JSON with this exact structure:
{
  "salaryRange": {
    "min": number,
    "max": number,
    "currency": "string",
    "period": "annual"
  },
  "averageSalary": number,
  "salaryMethodology": "Detailed explanation of how the salary range was calculated, what factors were considered, and the basis for the recommendations",
  "jobRequirements": {
    "description": "Detailed 2-3 paragraph job description",
    "shortDescription": "Brief 1-2 sentence description (max 200 characters) perfect for job listing previews",
    "keyResponsibilities": "Key Responsibilities:\n\n• Responsibility 1 with detailed description\n• Responsibility 2 with detailed description\n• Responsibility 3 with detailed description\n• Responsibility 4 with detailed description\n• Responsibility 5 with detailed description\n• Responsibility 6 with detailed description",
    "qualifications": [
      "qualification1",
      "qualification2"
    ],
    "experienceLevel": "X-Y years",
    "educationRequirements": [
      "education1",
      "education2"
    ],
    "requiredSkills": [
      "skill1",
      "skill2"
    ],
    "benefitsAndPerks": [
      "benefit1",
      "benefit2"
    ]
  },
  "sources": [
    {
      "name": "Source Name",
      "url": "full_website_url",
      "methodology": "How the data was collected (e.g., 'Based on 500+ employee reports', 'Government labor statistics', 'Industry survey of 200+ companies')",
      "dataPoints": number_of_data_points,
      "lastUpdated": "2024/2025",
      "region": "specific_region_or_country",
      "salaryRange": {
        "min": number,
        "max": number,
        "currency": "string"
      }
    }
  ],
  "insights": [
    "insight1",
    "insight2"
  ],
  "disclaimer": "Job analysis and salary ranges are estimates based on available market data and may vary based on specific company, qualifications, and other factors."
}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1500, // Increased to handle full JSON response
        temperature: 0.3,
      });

      const aiResponse = completion.choices[0]?.message?.content?.trim() || '';
      
      // Parse the JSON response
      let parsedResponse;
      try {
        let jsonStr = aiResponse;
        
        // Remove markdown code blocks if present
        jsonStr = jsonStr.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '');
        
        // Extract JSON from the response (in case there's extra text)
        const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonStr = jsonMatch[0];
        }
        
        parsedResponse = JSON.parse(jsonStr);
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        console.error('AI Response (first 2000 chars):', aiResponse.substring(0, 2000));
        
        // Try to fix common JSON issues
        let fixedJson = aiResponse;
        try {
          // Remove markdown code blocks
          fixedJson = fixedJson.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '');
          
          // Extract JSON more carefully
          const startIndex = fixedJson.indexOf('{');
          const lastIndex = fixedJson.lastIndexOf('}');
          if (startIndex !== -1 && lastIndex !== -1 && lastIndex > startIndex) {
            fixedJson = fixedJson.substring(startIndex, lastIndex + 1);
          }
          
          // Fix common JSON formatting issues
          fixedJson = fixedJson
            .replace(/,\s*}/g, '}') // Remove trailing commas before }
            .replace(/,\s*]/g, ']') // Remove trailing commas before ]
            .replace(/\r?\n/g, ' ') // Replace line breaks with spaces
            .replace(/\t/g, ' ') // Replace tabs with spaces
            .replace(/\s+/g, ' ') // Collapse multiple spaces
            .replace(/"\s*,\s*"/g, '", "') // Fix spacing around commas in strings
            .replace(/:\s*"/g, ': "') // Fix spacing after colons
            .trim();
          
          console.log('Attempting to parse fixed JSON...');
          console.log('Fixed JSON (first 500 chars):', fixedJson.substring(0, 500));
          parsedResponse = JSON.parse(fixedJson);
          
        } catch (secondError) {
          console.error('Second parsing attempt failed:', secondError);
          console.error('Fixed JSON that failed (first 1000 chars):', fixedJson?.substring(0, 1000) || 'undefined');
          throw new InternalServerErrorException('Failed to parse salary recommendation - invalid JSON format');
        }
      }

      // Ensure experienceLevel is in correct format (X-Y years)
      let experienceLevel = parsedResponse.jobRequirements.experienceLevel;
      if (experienceLevel && !experienceLevel.match(/^\d+-\d+\s+years?$/i)) {
        // Extract years from text if possible
        const yearMatch = experienceLevel.match(/(\d+)[-\s]*(?:to|-)?\s*(\d+)\s*years?/i);
        if (yearMatch) {
          experienceLevel = `${yearMatch[1]}-${yearMatch[2]} years`;
        } else {
          // Default fallback based on common patterns
          const singleYearMatch = experienceLevel.match(/(\d+)\s*years?/i);
          if (singleYearMatch) {
            const year = parseInt(singleYearMatch[1]);
            experienceLevel = `${Math.max(1, year-1)}-${year+1} years`;
          } else {
            experienceLevel = "2-4 years"; // Default fallback
          }
        }
      }

      // Build the response
      const response: SalaryRecommendationResponseDto = {
        jobTitle,
        department,
        industry,
        location: `${location}${country ? `, ${country}` : ''}`,
        workType,
        salaryRange: parsedResponse.salaryRange,
        averageSalary: parsedResponse.averageSalary,
        salaryMethodology: parsedResponse.salaryMethodology,
        jobRequirements: {
          description: parsedResponse.jobRequirements.description,
          shortDescription: parsedResponse.jobRequirements.shortDescription,
          keyResponsibilities: parsedResponse.jobRequirements.keyResponsibilities,
          qualifications: parsedResponse.jobRequirements.qualifications,
          requiredSkills: parsedResponse.jobRequirements.requiredSkills,
          benefitsAndPerks: parsedResponse.jobRequirements.benefitsAndPerks
        },
        experienceLevel: experienceLevel,
        educationRequirements: parsedResponse.jobRequirements.educationRequirements,
        sources: parsedResponse.sources,
        insights: parsedResponse.insights,
        lastUpdated: new Date().toISOString(),
        disclaimer: parsedResponse.disclaimer || 'Job analysis and salary ranges are estimates based on available market data and may vary based on specific company, qualifications, and other factors.'
      };

      return response;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new InternalServerErrorException('Failed to generate salary recommendation');
    }
  }

  async rewriteJobDescription(jobDescription: string): Promise<{ rewrittenDescription: string }> {
    const prompt = `Rewrite the following job description to make it more professional, engaging, and well-structured. Return ONLY the rewritten job description without any titles, headers, or prefixes:

Original Job Description:
"${jobDescription}"

Guidelines:
- Use professional and clear language
- Structure the content logically with proper flow
- Remove any grammatical errors and typos
- Make it more engaging and appealing to candidates
- Ensure it follows industry best practices
- Maintain the core requirements and responsibilities
- Use active voice where appropriate
- Include compelling language that attracts top talent
- Start directly with the job description content
- Do not include titles like "Revised Job Description:" or any headers

Provide only the clean, professional job description content.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.4,
      });

      let rewrittenDescription = completion.choices[0]?.message?.content?.trim() || '';
      
      // Remove any potential titles or headers that might slip through
      rewrittenDescription = rewrittenDescription
        .replace(/^(Revised Job Description:|Job Description:|Description:)\s*/i, '')
        .replace(/^(Here is the|Here's the|The following is|Below is).*?:\s*/i, '')
        .trim();

      return {
        rewrittenDescription
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new InternalServerErrorException('Failed to rewrite job description');
    }
  }

  async rewriteRequirements(requestDto: RequirementsPolishRequestDto): Promise<RequirementsPolishResponseDto> {
    const { requirements } = requestDto;

    const prompt = `You are a professional HR expert and content writer. Polish and improve the following job requirements and qualifications text to make it more professional, clear, and well-structured.

Original Requirements & Qualifications:
"${requirements}"

Instructions:
- Rewrite the content to be more professional and polished
- Use clear, concise language that is easy to understand
- Structure the content logically with proper formatting
- Remove any grammatical errors, typos, or awkward phrasing
- Ensure consistency in tone and style
- Use bullet points or numbered lists where appropriate
- Make it more appealing and comprehensive for potential candidates
- Maintain all the original requirements but present them better
- Use action-oriented language
- Follow industry best practices for job requirement writing

Return ONLY the polished requirements and qualifications content without any titles, headers, or prefixes. Start directly with the improved content.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800,
        temperature: 0.4,
      });

      let polishedRequirements = completion.choices[0]?.message?.content?.trim() || '';
      
      // Remove any potential titles or headers that might slip through
      polishedRequirements = polishedRequirements
        .replace(/^(Requirements & Qualifications:|Requirements:|Qualifications:|Polished Requirements:)\s*/i, '')
        .replace(/^(Here are the|Here is the|The following are|Below are).*?:\s*/i, '')
        .trim();

      return {
        polishedRequirements
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new InternalServerErrorException('Failed to polish requirements and qualifications');
    }
  }

  async rewriteJobTitle(requestDto: JobTitleRewriteRequestDto): Promise<JobTitleRewriteResponseDto> {
    const { jobTitle, industry, company, jobLevel } = requestDto;
    
    const contextParts: string[] = [];
    if (industry) contextParts.push(`Industry: ${industry}`);
    if (company) contextParts.push(`Company: ${company}`);
    if (jobLevel) contextParts.push(`Job Level: ${jobLevel}`);
    
    const context = contextParts.length > 0 ? `\n\nAdditional Context:\n${contextParts.join('\n')}` : '';
    
    const prompt = `You are an HR expert specializing in job title optimization and department classification. Your task is to rewrite and enhance the given job title to make it more professional, clear, and industry-standard, then determine the most appropriate department.

Original Job Title: "${jobTitle}"${context}

Instructions:
1. Rewrite the job title to be:
   - Professional and industry-standard
   - Clear and specific about the role
   - Concise but descriptive
   - Properly capitalized
   - Free of unnecessary words or jargon

2. Determine the most appropriate department based on the job title and responsibilities. Return the department name with "Department" suffix. Common departments include:
   - Engineering Department
   - Sales Department
   - Marketing Department
   - Human Resources Department
   - Finance Department
   - Operations Department
   - Customer Service Department
   - Product Management Department
   - Design Department
   - Legal Department
   - Business Development Department
   - Data Analytics Department
   - Quality Assurance Department
   - Administration Department
   - Research & Development Department
   - Consulting Department

Guidelines:
- Maintain the core role and responsibilities implied by the original title
- Use standard industry terminology
- Consider the seniority level (if mentioned)
- Choose the most specific and accurate department
- If the role spans multiple departments, choose the primary one

Return ONLY a JSON response with this exact structure:
{
  "jobTitle": "Enhanced Professional Job Title",
  "department": "Primary Department Name Department"
}

Example response:
{
  "jobTitle": "Sales Representative",
  "department": "Sales Department"
}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200,
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
        console.error('Failed to parse job title rewrite response:', parseError);
        console.error('AI Response:', aiResponse);
        
        // Fallback: try to extract information manually
        const titleMatch = aiResponse.match(/(?:job\s*title|title)["']?\s*:\s*["']([^"']+)["']/i);
        const departmentMatch = aiResponse.match(/(?:department)["']?\s*:\s*["']([^"']+)["']/i);
        
        if (titleMatch && departmentMatch) {
          parsedResponse = {
            jobTitle: titleMatch[1].trim(),
            department: departmentMatch[1].trim()
          };
        } else {
          // Ultimate fallback
          throw new InternalServerErrorException('Failed to parse job title rewrite response');
        }
      }

      return {
        jobTitle: parsedResponse.jobTitle || jobTitle,
        department: parsedResponse.department || 'General Department'
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new InternalServerErrorException('Failed to rewrite job title');
    }
  }

  async rewriteBenefits(requestDto: BenefitsPolishRequestDto): Promise<BenefitsPolishResponseDto> {
    const { benefits, industry, jobLevel, company } = requestDto;
    
    const contextParts: string[] = [];
    if (industry) contextParts.push(`Industry: ${industry}`);
    if (jobLevel) contextParts.push(`Job Level: ${jobLevel}`);
    if (company) contextParts.push(`Company: ${company}`);
    
    const context = contextParts.length > 0 ? `\n\nAdditional Context:\n${contextParts.join('\n')}` : '';
    
    const prompt = `You are an HR benefits specialist with expertise in creating compelling and professional benefits packages. Your task is to rewrite and enhance the given benefits & perks section to make it more professional, attractive, and comprehensive.

Original Benefits & Perks:
"${benefits}"${context}

Instructions:
1. Rewrite the benefits to be:
   - Professional and clear in language
   - Properly formatted and organized
   - Specific and detailed where appropriate
   - Attractive to potential candidates
   - Industry-standard and competitive
   - Free of grammatical errors and typos

2. Structure the benefits in a logical order:
   - Health and wellness benefits first
   - Financial benefits (salary, bonuses, equity)
   - Time off and flexibility
   - Professional development
   - Work environment and perks
   - Additional benefits

3. Use professional terminology and avoid casual language
4. Make each benefit sound valuable and compelling
5. Ensure benefits are realistic and commonly offered
6. Group similar benefits together with clear categories

Guidelines:
- Use bullet points or clear formatting
- Be specific about benefit details when possible
- Maintain the original intent but enhance presentation
- Add standard benefits if the original list seems incomplete
- Make it sound attractive to top talent

Return ONLY the polished benefits text without any titles, headers, or additional commentary. Start directly with the enhanced benefits content.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 600,
        temperature: 0.4,
      });

      let polishedBenefits = completion.choices[0]?.message?.content?.trim() || '';
      
      // Remove any potential titles or headers that might slip through
      polishedBenefits = polishedBenefits
        .replace(/^(Benefits & Perks:|Benefits:|Perks:)\s*/i, '')
        .replace(/^(Here are the|Here's the|The following are|Below are).*?:\s*/i, '')
        .trim();

      return {
        polishedBenefits
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new InternalServerErrorException('Failed to rewrite benefits');
    }
  }

  async rewriteResponsibilities(requestDto: ResponsibilitiesPolishRequestDto): Promise<ResponsibilitiesPolishResponseDto> {
    const { responsibilities, industry, jobLevel, jobTitle, company } = requestDto;
    
    const contextParts: string[] = [];
    if (industry) contextParts.push(`Industry: ${industry}`);
    if (jobLevel) contextParts.push(`Job Level: ${jobLevel}`);
    if (jobTitle) contextParts.push(`Job Title: ${jobTitle}`);
    if (company) contextParts.push(`Company: ${company}`);
    
    const context = contextParts.length > 0 ? `\n\nAdditional Context:\n${contextParts.join('\n')}` : '';
    
    const prompt = `You are an HR specialist with expertise in creating compelling and professional job responsibility sections. Your task is to rewrite and enhance the given Key Responsibilities section to make it more professional, clear, and impactful.

Original Key Responsibilities:
"${responsibilities}"${context}

Instructions:
1. Rewrite the responsibilities to be:
   - Professional and clear in language
   - Properly formatted with consistent bullet points
   - Specific and action-oriented
   - Attractive to potential candidates
   - Industry-appropriate and realistic
   - Free of grammatical errors and typos

2. Structure the responsibilities:
   - Start with "Key Responsibilities:" as the section title
   - Use bullet points (•) for each responsibility
   - Order from most important to least important
   - Each bullet should be 1-2 lines maximum
   - Use strong action verbs (develop, manage, implement, etc.)

3. Enhance the content:
   - Make each responsibility sound impactful and valuable
   - Add specific details where appropriate
   - Ensure consistency in tone and style
   - Use professional terminology
   - Make it appealing to qualified candidates

Guidelines:
- Maintain the original intent but enhance presentation
- Keep 6-10 key responsibilities (add or remove as needed)
- Use parallel structure for all bullet points
- Start each bullet with a strong action verb
- Be specific about outcomes and impact when possible
- Ensure responsibilities are realistic and achievable

Return ONLY the polished Key Responsibilities section without any additional commentary. Start directly with "Key Responsibilities:" followed by the enhanced bullet points.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 600,
        temperature: 0.4,
      });

      let polishedResponsibilities = completion.choices[0]?.message?.content?.trim() || '';
      
      // Remove any potential extra headers that might slip through
      polishedResponsibilities = polishedResponsibilities
        .replace(/^(Here is the|Here's the|The following is|Below is).*?:\s*/i, '')
        .trim();

      return {
        polishedResponsibilities
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new InternalServerErrorException('Failed to rewrite responsibilities');
    }
  }

  async rewriteAboutCompany(requestDto: AboutCompanyPolishRequestDto): Promise<AboutCompanyPolishResponseDto> {
    const { aboutCompany, industry, companyName, companySize, location } = requestDto;
    
    const contextParts: string[] = [];
    if (industry) contextParts.push(`Industry: ${industry}`);
    if (companyName) contextParts.push(`Company Name: ${companyName}`);
    if (location) contextParts.push(`Location: ${location}`);
    // Note: Excluding companySize to avoid team size mentions in output
    
    const context = contextParts.length > 0 ? `\n\nAdditional Context:\n${contextParts.join('\n')}` : '';
    
    const prompt = `You are an expert in crafting professional company culture profiles that help job candidates understand organizational values and work environment. Your task is to rewrite the company description to showcase company culture, values, and what it's like to work there.

Original About the Company:
"${aboutCompany}"${context}

CRITICAL INSTRUCTIONS - CULTURE & VALUES FOCUSED:
1. Create a professional company description that helps candidates understand:
   - Company culture and work environment
   - Core organizational values and principles
   - What it's like to work at this organization
   - The company's mission and vision in practice
   - How employees are valued and supported
   - Professional standards and expectations
   - MUST be maximum 800 characters including spaces

2. Structure Requirements - Culture & Values:
   - Do NOT include "About the Company:" title - start directly with content
   - Create 2-3 concise paragraphs focused on culture and values
   - First paragraph: Company mission, values, and organizational principles
   - Second paragraph: Work environment, culture, and employee experience
   - Third paragraph (if space allows): Professional standards and expectations

3. Language Guidelines - Culture Communication:
   - Use professional language that conveys company personality
   - Focus on organizational values, ethics, and principles
   - Describe the work environment and team dynamics
   - Highlight how the company supports its employees
   - Explain what drives the organization's decisions and actions
   - Show the company's commitment to its people and mission
   - Make every word count due to character limit

4. Culture & Values Content:
   - Highlight core company values and how they're practiced
   - Describe the work environment and collaborative approach
   - Show commitment to employee development and growth
   - Explain the company's mission and purpose
   - Include information about professional standards
   - Demonstrate how the company treats its employees
   - NEVER mention team size, number of employees, or headcount
   - Focus on organizational character and workplace culture

5. Professional Standards - Culture Showcase:
   - Help candidates understand if they'll fit the culture
   - Show what the company stands for and believes in
   - Demonstrate the company's commitment to its values
   - Explain the professional environment and expectations
   - Make candidates understand the organizational personality
   - MAXIMUM 800 characters total

Return ONLY the culture and values-focused company description without any title or header. Write content that helps candidates understand the company culture, values, and what makes this organization unique as a workplace. Ensure the response is maximum 800 characters.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o', // Upgraded to GPT-4o for higher quality
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300, // Reduced for concise content within 800 chars
        temperature: 0.3, // Lower temperature for more consistent quality
      });

      let polishedAboutCompany = completion.choices[0]?.message?.content?.trim() || '';
      
      // Remove any potential titles or headers that might slip through
      polishedAboutCompany = polishedAboutCompany
        .replace(/^(About the Company:|About Us:|Company Overview:)\s*/i, '')
        .replace(/^(Here is the|Here's the|The following is|Below is).*?:\s*/i, '')
        .trim();

      // Ensure character limit of 800 characters
      if (polishedAboutCompany.length > 800) {
        polishedAboutCompany = polishedAboutCompany.substring(0, 800).trim();
        
        // Try to end at a complete sentence or word
        const lastPeriod = polishedAboutCompany.lastIndexOf('.');
        const lastSpace = polishedAboutCompany.lastIndexOf(' ');
        
        if (lastPeriod > 600) { // If there's a period reasonably close to the end
          polishedAboutCompany = polishedAboutCompany.substring(0, lastPeriod + 1);
        } else if (lastSpace > 700) { // Otherwise, end at the last complete word
          polishedAboutCompany = polishedAboutCompany.substring(0, lastSpace);
        }
      }

      return {
        polishedAboutCompany
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new InternalServerErrorException('Failed to rewrite about company section');
    }
  }

  async generateAIConfig(requestDto: AIConfigRequestDto): Promise<AIConfigResponseDto> {
    const { jobTitle, department, industry, jobLevel, description, responsibilities, requirements, skills } = requestDto;
    
    // Build context for AI prompt generation
    const jobContext = {
      title: jobTitle,
      dept: department,
      industry: industry,
      level: jobLevel,
      desc: description || '',
      resp: responsibilities || '',
      req: requirements || '',
      skills: skills?.join(', ') || ''
    };

    const prompt = `You are an expert HR technology specialist who creates sophisticated AI prompts for recruitment processes. Generate three comprehensive AI prompts for the following position:

Job Details:
- Title: ${jobContext.title}
- Department: ${jobContext.dept}
- Industry: ${jobContext.industry}
- Level: ${jobContext.level}
- Description: ${jobContext.desc}
- Responsibilities: ${jobContext.resp}
- Requirements: ${jobContext.req}
- Key Skills: ${jobContext.skills}

Generate three specialized AI prompts:

1. CV ANALYSIS PROMPT: Create a comprehensive prompt for AI to analyze candidate CVs against this job position. The prompt should guide AI to evaluate qualifications, experience relevance, skills match, and provide scoring with detailed feedback.

2. FIRST INTERVIEW PROMPT: Create a prompt for conducting initial screening interviews. Should include behavioral questions, technical assessments relevant to the role, and evaluation criteria for determining if candidates proceed to next round.

3. SECOND INTERVIEW PROMPT: Create a prompt for in-depth final interviews. Should include advanced technical questions, culture fit assessment, scenario-based questions, and final evaluation criteria.

Each prompt should be:
- Professional and comprehensive
- Tailored specifically to this job position
- Include clear evaluation criteria
- Provide structured assessment guidelines
- Be ready to use by AI systems

Return ONLY valid JSON with this exact structure:
{
  "aiCvAnalysisPrompt": "Comprehensive CV analysis prompt text here...",
  "aiFirstInterviewPrompt": "Detailed first interview prompt text here...",
  "aiSecondInterviewPrompt": "Advanced second interview prompt text here..."
}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
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
        throw new InternalServerErrorException('Failed to parse AI configuration response');
      }

      return {
        aiCvAnalysisPrompt: parsedResponse.aiCvAnalysisPrompt || '',
        aiFirstInterviewPrompt: parsedResponse.aiFirstInterviewPrompt || '',
        aiSecondInterviewPrompt: parsedResponse.aiSecondInterviewPrompt || ''
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new InternalServerErrorException('Failed to generate AI configuration');
    }
  }

}