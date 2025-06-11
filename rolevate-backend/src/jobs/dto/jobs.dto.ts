import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { ExperienceLevel, WorkType } from '@prisma/client';

export class GetJobsQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  companyId?: string;

  @IsOptional()
  @IsEnum(ExperienceLevel)
  experienceLevel?: ExperienceLevel;

  @IsOptional()
  @IsEnum(WorkType)
  workType?: WorkType;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isFeatured?: boolean;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class JobResponseDto {
  id: string;
  title: string;
  description: string;
  requirements: string;
  responsibilities?: string | null;
  benefits?: string | null;
  skills: string[];
  experienceLevel: ExperienceLevel;
  location?: string | null;
  workType: WorkType;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency?: string | null;
  isActive: boolean;
  isFeatured: boolean;
  viewCount: number;
  applicationCount: number;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date | null;
  publishedAt?: Date | null;
  company: {
    id: string;
    name: string;
    displayName?: string | null;
    logo?: string | null;
    location?: string | null;
    industry?: string | null;
  };
  createdBy: {
    id: string;
    name?: string | null;
    username: string;
  };
}

export class JobsListResponseDto {
  jobs: JobResponseDto[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class JobDetailsResponseDto extends JobResponseDto {
  // Additional fields for detailed view
  technicalQuestions?: any;
  behavioralQuestions?: any;
  enableAiInterview: boolean;
  aiPrompt?: string | null;
  interviewDuration?: number;
  applications?: {
    id: string;
    status: string;
    appliedAt: Date;
    candidate: {
      id: string;
      name: string;
      email: string;
    };
  }[];
}
