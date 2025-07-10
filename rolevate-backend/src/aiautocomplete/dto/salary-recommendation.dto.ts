import { IsString, IsOptional, IsEnum } from 'class-validator';

export class SalaryRecommendationRequestDto {
  @IsString()
  jobTitle: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsString()
  @IsOptional()
  industry?: string;

  @IsEnum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE', 'INTERNSHIP'])
  @IsOptional()
  employeeType?: string;

  @IsEnum(['ENTRY', 'JUNIOR', 'MID', 'SENIOR', 'LEAD', 'MANAGER', 'DIRECTOR', 'EXECUTIVE'])
  @IsOptional()
  jobLevel?: string;

  @IsEnum(['REMOTE', 'HYBRID', 'ONSITE'])
  @IsOptional()
  workType?: string;

  @IsString()
  location: string;

  @IsString()
  @IsOptional()
  country?: string;
}

export class SalaryRange {
  min: number;
  max: number;
  currency: string;
  period: string; // 'annual', 'monthly', 'hourly'
}

export class SalarySource {
  name: string;
  url?: string;
  methodology: string;
  dataPoints: number;
  lastUpdated?: string;
  region: string;
  salaryRange: {
    min: number;
    max: number;
    currency: string;
  };
}

export class JobRequirements {
  description: string;
  shortDescription?: string;
  keyResponsibilities: string;
  qualifications: string[];
  requiredSkills: string[];
  benefitsAndPerks?: string[];
}

export class SalaryRecommendationResponseDto {
  jobTitle: string;
  department?: string;
  industry?: string;
  location: string;
  workType?: string;
  salaryRange: SalaryRange;
  averageSalary: number;
  salaryMethodology: string;
  jobRequirements: JobRequirements;
  experienceLevel: string;
  educationRequirements: string[];
  sources: SalarySource[];
  insights: string[];
  lastUpdated: string;
  disclaimer: string;
}
