import { InputType, Field, ID } from '@nestjs/graphql';
import { IsString, IsOptional, IsEnum, IsDateString, IsArray, IsBoolean } from 'class-validator';
import { JobType, JobLevel, WorkType, JobStatus } from './job.entity';

@InputType()
export class UpdateJobInput {
  @Field(() => ID)
  @IsString()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  department?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  location?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  salary?: string;

  @Field(() => JobType, { nullable: true })
  @IsOptional()
  @IsEnum(JobType)
  type?: JobType;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  deadline?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  responsibilities?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  requirements?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  benefits?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  experience?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  education?: string;

  @Field(() => JobLevel, { nullable: true })
  @IsOptional()
  @IsEnum(JobLevel)
  jobLevel?: JobLevel;

  @Field(() => WorkType, { nullable: true })
  @IsOptional()
  @IsEnum(WorkType)
  workType?: WorkType;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  industry?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  companyDescription?: string;

  @Field(() => JobStatus, { nullable: true })
  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  cvAnalysisPrompt?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  interviewPrompt?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  aiSecondInterviewPrompt?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  interviewLanguage?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  featured?: boolean;
}
