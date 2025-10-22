import { IsString, IsEmail, IsOptional, IsBoolean, IsUrl, IsEnum } from 'class-validator';

export enum CVStatus {
  UPLOADED = 'UPLOADED',
  PROCESSING = 'PROCESSING',
  PROCESSED = 'PROCESSED',
  ERROR = 'ERROR'
}

export class CreateBasicCandidateProfileDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsUrl()
  cvUrl?: string;

  @IsOptional()
  @IsString()
  currentLocation?: string;

  @IsOptional()
  @IsBoolean()
  isOpenToWork?: boolean;
}

export class CandidateProfileResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: Date;
  nationality?: string;
  currentLocation?: string;
  currentJobTitle?: string;
  currentCompany?: string;
  experienceLevel?: string;
  totalExperience?: number;
  expectedSalary?: number;
  noticePeriod?: string;
  highestEducation?: string;
  fieldOfStudy?: string;
  university?: string;
  graduationYear?: number;
  skills: string[];
  preferredJobTypes: string[];
  preferredWorkType?: string;
  preferredIndustries: string[];
  preferredLocations: string[];
  savedJobs: string[]; // Array of saved job IDs
  resumeUrl?: string;
  portfolioUrl?: string;
  linkedInUrl?: string;
  githubUrl?: string;
  isProfilePublic: boolean;
  isOpenToWork: boolean;
  profileSummary?: string;
  userId?: string;
  cvs: CVResponseDto[];
  applications: ApplicationResponseDto[];
  workExperiences: WorkExperienceResponseDto[];
  educationHistory: EducationResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}

// Simplified placeholder DTOs for compatibility
export class CVResponseDto {
  id: string;
  fileName: string;
  originalFileName?: string | null;
  fileUrl: string;
  fileSize?: number | null;
  mimeType?: string | null;
  status: CVStatus;
  isActive: boolean;
  candidateId: string;
  uploadedAt: Date;
  processedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class ApplicationResponseDto {
  id: string;
  status: string;
  appliedAt: Date;
  candidateId: string;
  jobId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class WorkExperienceResponseDto {
  id: string;
  jobTitle: string;
  company: string;
  candidateId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class EducationResponseDto {
  id: string;
  degree: string;
  institution: string;
  candidateId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class UpdateCVStatusDto {
  @IsEnum(CVStatus)
  status: CVStatus;
}

export class SaveJobDto {
  @IsString()
  jobId: string;
}

export class UnsaveJobDto {
  @IsString()
  jobId: string;
}
