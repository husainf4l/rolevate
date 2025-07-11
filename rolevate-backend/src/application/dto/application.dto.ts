import { IsString, IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { ApplicationStatus } from '@prisma/client';

export class CreateApplicationDto {
  @IsString()
  jobId: string;

  @IsOptional()
  @IsString()
  coverLetter?: string;

  @IsOptional()
  @IsString()
  expectedSalary?: string;

  @IsOptional()
  @IsString()
  noticePeriod?: string;

  @IsOptional()
  @IsString()
  resumeUrl?: string; // Optional custom resume for this application
}

export class UpdateApplicationStatusDto {
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;
}

export class AnalyzeCVDto {
  @IsString()
  applicationId: string;
}

export class ApplicationResponseDto {
  id: string;
  status: ApplicationStatus;
  jobId: string;
  candidateId: string;
  coverLetter?: string;
  resumeUrl?: string;
  expectedSalary?: string;
  noticePeriod?: string;
  
  // AI Analysis Results
  cvAnalysisScore?: number;
  cvAnalysisResults?: CVAnalysisResultDto;
  analyzedAt?: Date;
  
  // Company Notes
  companyNotes?: string;
  
  // Timeline
  appliedAt: Date;
  reviewedAt?: Date;
  interviewScheduledAt?: Date;
  interviewedAt?: Date;
  rejectedAt?: Date;
  acceptedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
  
  // Related data
  job?: {
    id: string;
    title: string;
    company: {
      name: string;
    };
  };
  
  candidate?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export class CVAnalysisResultDto {
  score: number; // 0-100
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  skillsMatch: {
    matched: string[];
    missing: string[];
    percentage: number;
  };
  experienceMatch: {
    relevant: boolean;
    years: number;
    details: string;
  };
  educationMatch: {
    relevant: boolean;
    details: string;
  };
  overallFit: 'Excellent' | 'Good' | 'Fair' | 'Poor';
}
