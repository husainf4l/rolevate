import { InputType, Field } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { ApplicationStatus } from './application.entity';

@InputType()
export class CreateApplicationInput {
  @Field()
  jobId: string;

  @Field()
  candidateId: string;

  @Field(() => ApplicationStatus, { nullable: true })
  status?: ApplicationStatus;

  @Field({ nullable: true })
  coverLetter?: string;

  @Field({ nullable: true })
  resumeUrl?: string;

  @Field({ nullable: true })
  expectedSalary?: string;

  @Field({ nullable: true })
  noticePeriod?: string;

  @Field({ nullable: true })
  source?: string;

  @Field({ nullable: true })
  notes?: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  aiAnalysis?: any;

  @Field({ nullable: true })
  interviewScheduled?: boolean;
}