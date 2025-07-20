import { IsString, IsEnum, IsOptional, IsArray, IsDateString, IsBoolean, ValidateNested } from 'class-validator';
import { Type, Transform } from 'class-transformer';

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
  @IsString()
  title: string;

  @IsString()
  department: string;

  @IsString()
  location: string;

  @IsString()
  salary: string;

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

  @IsDateString()
  deadline: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsString()
  responsibilities: string;

  @IsString()
  requirements: string;

  @IsString()
  benefits: string;

  @IsArray()
  @IsString({ each: true })
  skills: string[];

  @IsString()
  experience: string;

  @IsString()
  education: string;

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

  @IsString()
  industry: string;

  @IsString()
  companyDescription: string;



  @IsOptional()
  @IsString()
  cvAnalysisPrompt?: string;

  @IsOptional()
  @IsString()
  interviewPrompt?: string;

  @IsOptional()
  @IsString()
  aiCvAnalysisPrompt?: string;

  @IsOptional()
  @IsString()
  aiFirstInterviewPrompt?: string;

  @IsOptional()
  @IsString()
  aiSecondInterviewPrompt?: string;
}

export class JobResponseDto {
  id: string;
  title: string;
  department: string;
  location: string;
  salary: string;
  type: JobType;
  deadline: Date;
  description: string;
  shortDescription?: string;
  responsibilities: string;
  requirements: string;
  benefits: string;
  skills: string[];
  experience: string;
  education: string;
  jobLevel: JobLevel;
  workType: WorkType;
  industry: string;
  companyDescription: string;
  status: string;
  companyId: string;
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

  cvAnalysisPrompt?: string;
  interviewPrompt?: string;
  aiSecondInterviewPrompt?: string;
  featured: boolean;
  applicants: number;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}


