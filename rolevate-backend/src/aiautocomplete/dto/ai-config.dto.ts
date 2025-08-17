import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class AIConfigRequestDto {
  @IsString()
  @IsNotEmpty()
  jobTitle: string;

  @IsString()
  @IsNotEmpty()
  department: string;

  @IsString()
  @IsNotEmpty()
  industry: string;

  @IsString()
  @IsNotEmpty()
  jobLevel: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  responsibilities?: string;

  @IsString()
  @IsOptional()
  requirements?: string;

  @IsArray()
  @IsOptional()
  skills?: string[];

  @IsString()
  @IsOptional()
  interviewLanguage?: string;

  @IsString()
  @IsOptional()
  interviewQuestions?: string;
}

export class AIConfigResponseDto {
  aiCvAnalysisPrompt: string;
  aiFirstInterviewPrompt: string;
  aiSecondInterviewPrompt: string;
}
