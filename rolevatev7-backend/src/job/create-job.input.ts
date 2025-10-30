import { InputType, Field, registerEnumType } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString, IsArray, IsBoolean } from 'class-validator';
import { JobType, JobLevel, WorkType, JobStatus } from './job.entity';

// Register enums for GraphQL
registerEnumType(JobType, { name: 'JobType' });
registerEnumType(JobLevel, { name: 'JobLevel' });
registerEnumType(WorkType, { name: 'WorkType' });
registerEnumType(JobStatus, { name: 'JobStatus' });

@InputType()
export class CreateJobInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  department: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  location: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  salary: string;

  @Field(() => JobType)
  @IsEnum(JobType)
  type: JobType;

  @Field()
  @IsDateString()
  deadline: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  description: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  shortDescription: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  responsibilities: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  requirements: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  benefits: string;

  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  skills: string[];

  @Field()
  @IsString()
  @IsNotEmpty()
  experience: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  education: string;

  @Field(() => JobLevel)
  @IsEnum(JobLevel)
  jobLevel: JobLevel;

  @Field(() => WorkType)
  @IsEnum(WorkType)
  workType: WorkType;

  @Field()
  @IsString()
  @IsNotEmpty()
  industry: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  companyDescription: string;

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

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  postedById?: string;
}