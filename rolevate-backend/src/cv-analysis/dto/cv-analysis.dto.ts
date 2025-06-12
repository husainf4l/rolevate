import { IsString, IsOptional, IsNumber, IsArray, IsUUID, IsJSON, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCvAnalysisDto {
  @IsString()
  cvUrl: string;

  @IsOptional()
  @IsString()
  extractedText?: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  overallScore: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  skillsScore: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  experienceScore: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  educationScore: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  languageScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  certificationScore?: number;

  @IsString()
  summary: string;

  @IsArray()
  @IsString({ each: true })
  strengths: string[];

  @IsArray()
  @IsString({ each: true })
  weaknesses: string[];

  @IsArray()
  @IsString({ each: true })
  suggestedImprovements: string[];

  @IsArray()
  @IsString({ each: true })
  skills: string[];

  @IsOptional()
  @IsJSON()
  experience?: any;

  @IsOptional()
  @IsJSON()
  education?: any;

  @IsArray()
  @IsString({ each: true })
  certifications: string[];

  @IsOptional()
  @IsJSON()
  languages?: any;

  @IsOptional()
  @IsString()
  aiModel?: string;

  @IsOptional()
  @IsNumber()
  processingTime?: number;

  @IsUUID()
  candidateId: string;

  @IsUUID()
  applicationId: string;
}

export class UpdateCvAnalysisDto {
  @IsOptional()
  @IsString()
  cvUrl?: string;

  @IsOptional()
  @IsString()
  extractedText?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  overallScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  skillsScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  experienceScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  educationScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  languageScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  certificationScore?: number;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  strengths?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  weaknesses?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  suggestedImprovements?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsJSON()
  experience?: any;

  @IsOptional()
  @IsJSON()
  education?: any;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certifications?: string[];

  @IsOptional()
  @IsJSON()
  languages?: any;

  @IsOptional()
  @IsString()
  aiModel?: string;

  @IsOptional()
  @IsNumber()
  processingTime?: number;
}

export class CvAnalysisQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsUUID()
  candidateId?: string;

  @IsOptional()
  @IsUUID()
  applicationId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  minScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  maxScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string = 'analyzedAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
