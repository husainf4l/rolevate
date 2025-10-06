import { IsString, IsOptional, IsEnum, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApplicationStatus } from '@prisma/client';

export class CreateApplicationDto {
  @ApiProperty({
    description: 'Job ID to apply for',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsString()
  jobId: string;

  @ApiPropertyOptional({
    description: 'Cover letter for the application',
    example: 'I am very interested in this position because...'
  })
  @IsOptional()
  @IsString()
  coverLetter?: string;

  @ApiPropertyOptional({
    description: 'Expected salary',
    example: '$75,000 - $85,000'
  })
  @IsOptional()
  @IsString()
  expectedSalary?: string;

  @ApiPropertyOptional({
    description: 'Notice period',
    example: '2 weeks'
  })
  @IsOptional()
  @IsString()
  noticePeriod?: string;

  @ApiPropertyOptional({
    description: 'Resume URL (for authenticated users with existing resumes)',
    example: 'https://s3.amazonaws.com/bucket/resume.pdf'
  })
  @IsOptional()
  @IsString()
  resumeUrl?: string;

  // Anonymous application fields
  @ApiPropertyOptional({
    description: 'First name (for anonymous applications)',
    example: 'John'
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Last name (for anonymous applications)',
    example: 'Doe'
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Email address (for anonymous applications)',
    example: 'john.doe@example.com'
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    description: 'Phone number (for anonymous applications)',
    example: '+1-555-0123'
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Portfolio URL (for anonymous applications)',
    example: 'https://johndoe.dev'
  })
  @IsOptional()
  @IsString()
  portfolioUrl?: string;
}

// Separate DTO for anonymous applications with file upload
export class CreateAnonymousApplicationDto {
  @ApiProperty({
    description: 'Job ID to apply for',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsString()
  jobId: string;

  @ApiPropertyOptional({
    description: 'Cover letter for the application',
    example: 'I am very interested in this position because...'
  })
  @IsOptional()
  @IsString()
  coverLetter?: string;

  @ApiPropertyOptional({
    description: 'Expected salary',
    example: '$75,000 - $85,000'
  })
  @IsOptional()
  @IsString()
  expectedSalary?: string;

  @ApiPropertyOptional({
    description: 'Notice period',
    example: '2 weeks'
  })
  @IsOptional()
  @IsString()
  noticePeriod?: string;

  // Manual candidate information
  @ApiPropertyOptional({
    description: 'First name',
    example: 'John'
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Last name',
    example: 'Doe'
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({
    description: 'Email address',
    example: 'john.doe@example.com'
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'Phone number',
    example: '+1-555-0123'
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Portfolio URL',
    example: 'https://johndoe.dev'
  })
  @IsOptional()
  @IsString()
  portfolioUrl?: string;
}

export class UpdateApplicationStatusDto {
  @ApiProperty({
    description: 'New application status',
    enum: ApplicationStatus,
    example: 'REVIEWED'
  })
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;
}

export class AnalyzeCVDto {
  @IsString()
  applicationId: string;
}

export class CVAnalysisResultDto {
  @ApiProperty({
    description: 'Overall CV score (0-100)',
    example: 85,
    minimum: 0,
    maximum: 100
  })
  score: number;

  @ApiProperty({
    description: 'Summary of the CV analysis',
    example: 'Strong technical background with 5+ years of experience in full-stack development.'
  })
  summary: string;

  @ApiProperty({
    description: 'Strengths identified in the CV',
    type: [String],
    example: ['Excellent technical skills', 'Strong educational background', 'Relevant work experience']
  })
  strengths: string[];

  @ApiProperty({
    description: 'Weaknesses identified in the CV',
    type: [String],
    example: ['Limited leadership experience', 'Could improve communication skills']
  })
  weaknesses: string[];

  @ApiProperty({
    description: 'Recommendations for improvement',
    type: [String],
    example: ['Consider gaining more leadership experience', 'Take communication skills training']
  })
  recommendations: string[];

  @ApiProperty({
    description: 'Skills match analysis',
    type: 'object',
    properties: {
      matched: { type: 'array', items: { type: 'string' }, example: ['JavaScript', 'React', 'Node.js'] },
      missing: { type: 'array', items: { type: 'string' }, example: ['Python', 'AWS'] },
      percentage: { type: 'number', example: 75 }
    }
  })
  skillsMatch: {
    matched: string[];
    missing: string[];
    percentage: number;
  };

  @ApiProperty({
    description: 'Experience match analysis',
    type: 'object',
    properties: {
      relevant: { type: 'boolean', example: true },
      years: { type: 'number', example: 5 },
      details: { type: 'string', example: '5 years of relevant full-stack development experience' }
    }
  })
  experienceMatch: {
    relevant: boolean;
    years: number;
    details: string;
  };

  @ApiProperty({
    description: 'Education match analysis',
    type: 'object',
    properties: {
      relevant: { type: 'boolean', example: true },
      details: { type: 'string', example: "Bachelor's degree in Computer Science" }
    }
  })
  educationMatch: {
    relevant: boolean;
    details: string;
  };

  @ApiProperty({
    description: 'Overall fit assessment',
    enum: ['Excellent', 'Good', 'Fair', 'Poor'],
    example: 'Good'
  })
  overallFit: 'Excellent' | 'Good' | 'Fair' | 'Poor';
}

export class ApplicationResponseDto {
  @ApiProperty({
    description: 'Application ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;

  @ApiProperty({
    description: 'Application status',
    enum: ApplicationStatus,
    example: 'PENDING'
  })
  status: ApplicationStatus;

  @ApiProperty({
    description: 'Job ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  jobId: string;

  @ApiProperty({
    description: 'Candidate ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  candidateId: string;

  @ApiPropertyOptional({
    description: 'Cover letter',
    example: 'I am very interested in this position because...'
  })
  coverLetter?: string;

  @ApiPropertyOptional({
    description: 'Resume URL',
    example: 'https://s3.amazonaws.com/bucket/resume.pdf'
  })
  resumeUrl?: string;

  @ApiPropertyOptional({
    description: 'Expected salary',
    example: '$75,000 - $85,000'
  })
  expectedSalary?: string;

  @ApiPropertyOptional({
    description: 'Notice period',
    example: '2 weeks'
  })
  noticePeriod?: string;
  
  // AI Analysis Results
  @ApiPropertyOptional({
    description: 'CV analysis score (0-100)',
    example: 85
  })
  cvAnalysisScore?: number;

  @ApiPropertyOptional({
    description: 'Detailed CV analysis results'
  })
  cvAnalysisResults?: CVAnalysisResultDto;

  @ApiPropertyOptional({
    description: 'When CV was analyzed',
    example: '2024-01-15T10:30:00.000Z'
  })
  analyzedAt?: Date;
  
  // AI Recommendations
  @ApiPropertyOptional({
    description: 'AI CV analysis recommendations',
    example: 'Strong technical background, recommend for technical interview'
  })
  aiCvRecommendations?: string;

  @ApiPropertyOptional({
    description: 'AI interview recommendations',
    example: 'Focus on system design and leadership experience'
  })
  aiInterviewRecommendations?: string;

  @ApiPropertyOptional({
    description: 'AI second interview recommendations',
    example: 'Deep dive into cloud architecture experience'
  })
  aiSecondInterviewRecommendations?: string;

  @ApiPropertyOptional({
    description: 'When recommendations were generated',
    example: '2024-01-15T10:35:00.000Z'
  })
  recommendationsGeneratedAt?: Date;
  
  // Company Notes
  @ApiPropertyOptional({
    description: 'Company notes on the application',
    example: 'Excellent candidate, strong technical skills'
  })
  companyNotes?: string;
  
  // Timeline
  @ApiProperty({
    description: 'When the application was submitted',
    example: '2024-01-15T10:30:00.000Z'
  })
  appliedAt: Date;

  @ApiPropertyOptional({
    description: 'When the application was reviewed',
    example: '2024-01-16T14:20:00.000Z'
  })
  reviewedAt?: Date;

  @ApiPropertyOptional({
    description: 'When interview was scheduled',
    example: '2024-01-17T09:00:00.000Z'
  })
  interviewScheduledAt?: Date;

  @ApiPropertyOptional({
    description: 'When interview was conducted',
    example: '2024-01-18T10:00:00.000Z'
  })
  interviewedAt?: Date;

  @ApiPropertyOptional({
    description: 'When application was rejected',
    example: '2024-01-19T16:30:00.000Z'
  })
  rejectedAt?: Date;

  @ApiPropertyOptional({
    description: 'When application was accepted',
    example: '2024-01-20T11:15:00.000Z'
  })
  acceptedAt?: Date;
  
  @ApiProperty({
    description: 'Application creation timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Application last update timestamp',
    example: '2024-01-20T11:15:00.000Z'
  })
  updatedAt: Date;
  
  // Related data
  @ApiPropertyOptional({
    description: 'Job information',
    type: 'object',
    properties: {
      id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
      title: { type: 'string', example: 'Senior Software Engineer' },
      company: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'TechCorp Inc.' }
        }
      }
    }
  })
  job?: {
    id: string;
    title: string;
    company: {
      name: string;
    };
  };
  
  @ApiPropertyOptional({
    description: 'Candidate information',
    type: 'object',
    properties: {
      id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
      firstName: { type: 'string', example: 'John' },
      lastName: { type: 'string', example: 'Doe' },
      email: { type: 'string', example: 'john.doe@example.com' }
    }
  })
  candidate?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}
