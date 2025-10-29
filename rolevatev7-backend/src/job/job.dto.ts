import { ObjectType, Field, registerEnumType } from '@nestjs/graphql';
import { UserDto } from '../user/user.dto';
import { CompanyDto } from '../company/company.dto';
import { JobType, JobLevel, WorkType, JobStatus } from './job.entity';

// Register enums for GraphQL
registerEnumType(JobType, { name: 'JobType' });
registerEnumType(JobLevel, { name: 'JobLevel' });
registerEnumType(WorkType, { name: 'WorkType' });
registerEnumType(JobStatus, { name: 'JobStatus' });

@ObjectType()
export class JobDto {
  @Field()
  id: string;

  @Field()
  title: string;

  @Field()
  slug: string;

  @Field()
  department: string;

  @Field()
  location: string;

  @Field()
  salary: string;

  @Field(() => JobType)
  type: JobType;

  @Field()
  deadline: Date;

  @Field()
  description: string;

  @Field()
  shortDescription: string;

  @Field()
  responsibilities: string;

  @Field()
  requirements: string;

  @Field()
  benefits: string;

  @Field(() => [String])
  skills: string[];

  @Field()
  experience: string;

  @Field()
  education: string;

  @Field(() => JobLevel)
  jobLevel: JobLevel;

  @Field(() => WorkType)
  workType: WorkType;

  @Field()
  industry: string;

  @Field()
  companyDescription: string;

  @Field(() => JobStatus)
  status: JobStatus;

  @Field(() => CompanyDto, { nullable: true })
  company?: CompanyDto;

  @Field({ nullable: true })
  cvAnalysisPrompt?: string;

  @Field({ nullable: true })
  interviewPrompt?: string;

  @Field({ nullable: true })
  aiSecondInterviewPrompt?: string;

  @Field()
  interviewLanguage: string;

  @Field()
  featured: boolean;

  @Field()
  applicants: number;

  @Field()
  views: number;

  // Legacy field for backward compatibility
  @Field()
  featuredJobs: boolean;

  @Field(() => UserDto)
  postedBy: UserDto;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}