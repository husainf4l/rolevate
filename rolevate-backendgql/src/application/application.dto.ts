import { ObjectType, Field, ID } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { ApplicationStatus } from './application.entity';

@ObjectType()
export class ApplicationDto {
  @Field(() => ID)
  id: string;

  @Field()
  jobId: string;

  @Field()
  candidateId: string;

  @Field(() => ApplicationStatus)
  status: ApplicationStatus;

  @Field()
  appliedAt: Date;

  @Field({ nullable: true })
  coverLetter?: string;

  @Field({ nullable: true })
  resumeUrl?: string;

  @Field({ nullable: true })
  source?: string;

  @Field({ nullable: true })
  notes?: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  aiAnalysis?: any;

  @Field()
  interviewScheduled: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}