import { IsString, IsEnum, IsOptional, IsArray, IsDateString, IsBoolean, ValidateNested } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum InterviewLanguage {
  ENGLISH = 'english',
  ARABIC = 'arabic'
}

export enum JobType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  REMOTE = 'REMOTE'
}

export enum JobLevel {
  ENTRY = 'ENTRY',
  MID = 'MID', 
  SENIOR = 'SENIOR',
  EXECUTIVE = 'EXECUTIVE'
}

export enum WorkType {
  ONSITE = 'ONSITE',
  REMOTE = 'REMOTE',
  HYBRID = 'HYBRID'
}



export class CreateJobDto {
  @ApiProperty({
    description: 'Job title',
    example: 'Senior Software Engineer'
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Job department',
    example: 'Engineering'
  })
  @IsString()
  department: string;

  @ApiProperty({
    description: 'Job location',
    example: 'New York, NY'
  })
  @IsString()
  location: string;

  @ApiProperty({
    description: 'Salary range',
    example: '$80,000 - $120,000'
  })
  @IsString()
  salary: string;

  @ApiProperty({
    description: 'Job type',
    enum: JobType,
    example: 'FULL_TIME'
  })
  @IsString()
  @Transform(({ value }) => {
    // Convert frontend format to Prisma enum format
    const mapping = {
      'full-time': 'FULL_TIME',
      'part-time': 'PART_TIME',
      'contract': 'CONTRACT',
      'remote': 'REMOTE'
    };
    return mapping[value] || value.toUpperCase();
  })
  type: string;

  @ApiProperty({
    description: 'Application deadline',
    example: '2024-12-31'
  })
  @IsDateString()
  deadline: string;

  @ApiProperty({
    description: 'Job description',
    example: 'We are looking for a senior software engineer to join our team...'
  })
  @IsString()
  description: string;

  @ApiPropertyOptional({
    description: 'Short description for job listings',
    example: 'Join our innovative team building the future of tech.'
  })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiProperty({
    description: 'Job responsibilities',
    example: '• Develop and maintain web applications\n• Collaborate with cross-functional teams...'
  })
  @IsString()
  responsibilities: string;

  @ApiProperty({
    description: 'Job requirements',
    example: '• 5+ years of experience in software development\n• Proficiency in TypeScript and Node.js...'
  })
  @IsString()
  requirements: string;

  @ApiProperty({
    description: 'Job benefits',
    example: '• Competitive salary\n• Health insurance\n• Flexible working hours...'
  })
  @IsString()
  benefits: string;

  @ApiProperty({
    description: 'Required skills',
    type: [String],
    example: ['JavaScript', 'TypeScript', 'React', 'Node.js']
  })
  @IsArray()
  @IsString({ each: true })
  skills: string[];

  @ApiProperty({
    description: 'Experience requirements',
    example: '3-5 years'
  })
  @IsString()
  experience: string;

  @ApiProperty({
    description: 'Education requirements',
    example: "Bachelor's degree in Computer Science or related field"
  })
  @IsString()
  education: string;

  @ApiProperty({
    description: 'Job level',
    enum: JobLevel,
    example: 'SENIOR'
  })
  @IsString()
  @Transform(({ value }) => {
    // Convert frontend format to Prisma enum format
    const mapping = {
      'entry': 'ENTRY',
      'mid': 'MID',
      'senior': 'SENIOR',
      'executive': 'EXECUTIVE'
    };
    return mapping[value] || value.toUpperCase();
  })
  jobLevel: string;

  @ApiProperty({
    description: 'Work type',
    enum: WorkType,
    example: 'REMOTE'
  })
  @IsString()
  @Transform(({ value }) => {
    // Convert frontend format to Prisma enum format
    const mapping = {
      'onsite': 'ONSITE',
      'remote': 'REMOTE',
      'hybrid': 'HYBRID'
    };
    return mapping[value] || value.toUpperCase();
  })
  workType: string;

  @ApiProperty({
    description: 'Industry',
    example: 'Technology'
  })
  @IsString()
  industry: string;

  @ApiPropertyOptional({
    description: 'Company description',
    example: 'Leading technology company focused on innovation and growth.'
  })
  @IsOptional()
  @IsString()
  companyDescription?: string;

  @ApiPropertyOptional({
    description: 'Interview language',
    enum: InterviewLanguage,
    example: 'english'
  })
  @IsOptional()
  @IsEnum(InterviewLanguage)
  @Transform(({ value }) => value?.toLowerCase() || 'english')
  interviewLanguage?: InterviewLanguage = InterviewLanguage.ENGLISH;

  @ApiPropertyOptional({
    description: 'CV analysis prompt for AI',
    example: 'Analyze the candidate\'s experience and skills for this software engineering role.'
  })
  @IsOptional()
  @IsString()
  cvAnalysisPrompt?: string;

  @ApiPropertyOptional({
    description: 'Interview prompt for AI interviewer',
    example: 'Conduct a technical interview focusing on React and Node.js experience.'
  })
  @IsOptional()
  @IsString()
  interviewPrompt?: string;

  @ApiPropertyOptional({
    description: 'AI CV analysis prompt',
    example: 'Evaluate the candidate\'s technical skills and experience level.'
  })
  @IsOptional()
  @IsString()
  aiCvAnalysisPrompt?: string;

  @ApiPropertyOptional({
    description: 'AI first interview prompt',
    example: 'Ask about the candidate\'s background and experience.'
  })
  @IsOptional()
  @IsString()
  aiFirstInterviewPrompt?: string;

  @ApiPropertyOptional({
    description: 'AI second interview prompt',
    example: 'Dive deeper into technical skills and problem-solving abilities.'
  })
  @IsOptional()
  @IsString()
  aiSecondInterviewPrompt?: string;
}

export class JobResponseDto {
  @ApiProperty({
    description: 'Job ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;

  @ApiProperty({
    description: 'Job title',
    example: 'Senior Software Engineer'
  })
  title: string;

  @ApiProperty({
    description: 'Job department',
    example: 'Engineering'
  })
  department: string;

  @ApiProperty({
    description: 'Job location',
    example: 'New York, NY'
  })
  location: string;

  @ApiProperty({
    description: 'Salary range',
    example: '$80,000 - $120,000'
  })
  salary: string;

  @ApiProperty({
    description: 'Job type',
    enum: JobType,
    example: 'FULL_TIME'
  })
  type: JobType;
  @ApiProperty({
    description: 'Application deadline',
    example: '2024-12-31T23:59:59.000Z'
  })
  deadline: Date;

  @ApiProperty({
    description: 'Job description',
    example: 'We are looking for a senior software engineer to join our team...'
  })
  description: string;

  @ApiPropertyOptional({
    description: 'Short description for job listings',
    example: 'Join our innovative team building the future of tech.'
  })
  shortDescription?: string;

  @ApiProperty({
    description: 'Job responsibilities',
    example: '• Develop and maintain web applications\n• Collaborate with cross-functional teams...'
  })
  responsibilities: string;

  @ApiProperty({
    description: 'Job requirements',
    example: '• 5+ years of experience in software development\n• Proficiency in TypeScript and Node.js...'
  })
  requirements: string;

  @ApiProperty({
    description: 'Job benefits',
    example: '• Competitive salary\n• Health insurance\n• Flexible working hours...'
  })
  benefits: string;

  @ApiProperty({
    description: 'Required skills',
    type: [String],
    example: ['JavaScript', 'TypeScript', 'React', 'Node.js']
  })
  skills: string[];

  @ApiProperty({
    description: 'Experience requirements',
    example: '3-5 years'
  })
  experience: string;

  @ApiProperty({
    description: 'Education requirements',
    example: "Bachelor's degree in Computer Science or related field"
  })
  education: string;

  @ApiProperty({
    description: 'Job level',
    enum: JobLevel,
    example: 'SENIOR'
  })
  jobLevel: JobLevel;

  @ApiProperty({
    description: 'Work type',
    enum: WorkType,
    example: 'REMOTE'
  })
  workType: WorkType;

  @ApiProperty({
    description: 'Industry',
    example: 'Technology'
  })
  industry: string;

  @ApiProperty({
    description: 'Company description',
    example: 'Leading technology company focused on innovation and growth.'
  })
  companyDescription: string;

  @ApiPropertyOptional({
    description: 'Company logo URL',
    example: 'https://example.com/logo.png'
  })
  companyLogo?: string;

  @ApiProperty({
    description: 'Interview language',
    enum: InterviewLanguage,
    example: 'english'
  })
  interviewLanguage: InterviewLanguage;

  @ApiProperty({
    description: 'Job status',
    example: 'ACTIVE'
  })
  status: string;

  @ApiProperty({
    description: 'Company ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  companyId: string;

  @ApiPropertyOptional({
    description: 'Company information',
    type: 'object',
    properties: {
      id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
      name: { type: 'string', example: 'TechCorp Inc.' },
      logo: { type: 'string', example: 'https://example.com/logo.png' },
      address: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          street: { type: 'string', example: '123 Main St' },
          city: { type: 'string', example: 'New York' },
          state: { type: 'string', example: 'NY' },
          country: { type: 'string', example: 'USA' },
          zipCode: { type: 'string', example: '10001' }
        }
      }
    }
  })
  company?: {
    id: string;
    name: string;
    logo?: string;
    address?: {
      id: string;
      street: string;
      city: string;
      state: string;
      country: string;
      zipCode: string;
    };
  };

  @ApiPropertyOptional({
    description: 'CV analysis prompt for AI',
    example: 'Analyze the candidate\'s experience and skills for this software engineering role.'
  })
  cvAnalysisPrompt?: string;

  @ApiPropertyOptional({
    description: 'Interview prompt for AI interviewer',
    example: 'Conduct a technical interview focusing on React and Node.js experience.'
  })
  interviewPrompt?: string;

  @ApiPropertyOptional({
    description: 'AI second interview prompt',
    example: 'Dive deeper into technical skills and problem-solving abilities.'
  })
  aiSecondInterviewPrompt?: string;

  @ApiProperty({
    description: 'Whether the job is featured',
    example: true
  })
  featured: boolean;

  @ApiProperty({
    description: 'Number of applicants',
    example: 25
  })
  applicants: number;

  @ApiProperty({
    description: 'Number of views',
    example: 150
  })
  views: number;

  @ApiProperty({
    description: 'Job creation date',
    example: '2024-01-15T10:30:00.000Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Job last update date',
    example: '2024-01-20T14:45:00.000Z'
  })
  updatedAt: Date;
}


