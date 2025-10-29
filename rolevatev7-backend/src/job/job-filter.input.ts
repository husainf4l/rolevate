import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsEnum, IsString, IsBoolean, IsUUID } from 'class-validator';
import { JobType, JobLevel, WorkType, JobStatus } from './job.entity';

@InputType()
export class JobFilterInput {
  @Field(() => JobStatus, { nullable: true, description: 'Filter by job status' })
  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

  @Field(() => JobType, { nullable: true, description: 'Filter by job type' })
  @IsOptional()
  @IsEnum(JobType)
  type?: JobType;

  @Field(() => JobLevel, { nullable: true, description: 'Filter by job level' })
  @IsOptional()
  @IsEnum(JobLevel)
  jobLevel?: JobLevel;

  @Field(() => WorkType, { nullable: true, description: 'Filter by work type' })
  @IsOptional()
  @IsEnum(WorkType)
  workType?: WorkType;

  @Field({ nullable: true, description: 'Filter by industry (partial match)' })
  @IsOptional()
  @IsString()
  industry?: string;

  @Field({ nullable: true, description: 'Filter by location (partial match)' })
  @IsOptional()
  @IsString()
  location?: string;

  @Field({ nullable: true, description: 'Filter by department (partial match)' })
  @IsOptional()
  @IsString()
  department?: string;

  @Field({ nullable: true, description: 'Filter by user who posted the job' })
  @IsOptional()
  @IsUUID()
  postedById?: string;

  @Field({ nullable: true, description: 'Filter by company ID' })
  @IsOptional()
  @IsUUID()
  companyId?: string;

  @Field({ nullable: true, description: 'Filter by featured status' })
  @IsOptional()
  @IsBoolean()
  featured?: boolean;
}