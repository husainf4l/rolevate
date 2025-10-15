import { InputType, Field } from '@nestjs/graphql';
import { JobType, JobLevel, WorkType, JobStatus } from './job.entity';

@InputType()
export class JobFilterInput {
  @Field(() => JobStatus, { nullable: true })
  status?: JobStatus;

  @Field(() => JobType, { nullable: true })
  type?: JobType;

  @Field(() => JobLevel, { nullable: true })
  jobLevel?: JobLevel;

  @Field(() => WorkType, { nullable: true })
  workType?: WorkType;

  @Field({ nullable: true })
  industry?: string;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  department?: string;

  @Field({ nullable: true })
  postedById?: string;

  @Field({ nullable: true })
  companyId?: string;

  @Field({ nullable: true })
  featured?: boolean;
}