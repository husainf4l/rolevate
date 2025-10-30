import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsEnum, IsString, IsBoolean, IsUUID } from 'class-validator';
import { JobType, JobLevel, WorkType, JobStatus } from './job.entity';

@InputType()
export class JobFilterInput {
  @Field(() => JobStatus, { nullable: true })
  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

  @Field(() => JobType, { nullable: true })
  @IsOptional()
  @IsEnum(JobType)
  type?: JobType;

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
  location?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  department?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  postedById?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  companyId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  featured?: boolean;
}
