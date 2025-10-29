import { InputType, Field } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { InterviewType, InterviewStatus } from './interview.entity';

@InputType()
export class CreateInterviewInput {
  @Field()
  applicationId: string;

  @Field()
  interviewerId: string;

  @Field({ nullable: true })
  scheduledAt?: Date;

  @Field({ nullable: true })
  duration?: number;

  @Field(() => InterviewType, { nullable: true })
  type?: InterviewType;

  @Field(() => InterviewStatus, { nullable: true })
  status?: InterviewStatus;

  @Field({ nullable: true })
  notes?: string;

  @Field({ nullable: true })
  feedback?: string;

  @Field({ nullable: true })
  rating?: number;

  @Field(() => GraphQLJSONObject, { nullable: true })
  aiAnalysis?: any;

  @Field({ nullable: true })
  recordingUrl?: string;

  @Field({ nullable: true })
  roomId?: string;
}