import { IsString, IsEmail, IsOptional } from 'class-validator';

export class JobFitUploadDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  expectedSalary?: string;

  @IsString()
  @IsOptional()
  location?: string;
}

export class AvailableCandidateResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  
  // CV Information
  cvUrl: string;
  cvFileName?: string;
  
  // Extracted CV Analysis
  currentJobTitle?: string;
  currentCompany?: string;
  totalExperience?: number;
  skills: string[];
  education?: string;
  location?: string;
  expectedSalary?: string;
  
  // AI Analysis Summary
  profileSummary?: string;
  keyStrengths: string[];
  industryExperience: string[];
  
  // Metadata
  isActive: boolean;
  isOpenToWork: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

export class JobMatchResponseDto {
  candidates: AvailableCandidateResponseDto[];
  totalCount: number;
  page: number;
  limit: number;
  filters?: {
    skills?: string[];
    experienceRange?: { min: number; max: number };
    location?: string;
    jobTitle?: string;
  };
}
