import { ObjectType, Field, ID } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { InterviewType, InterviewStatus } from './interview.entity';

@ObjectType()
export class InterviewDto {
  @Field(() => ID)
  id: string;

  @Field()
  applicationId: string;

  @Field()
  interviewerId: string;

  @Field({ nullable: true })
  scheduledAt?: Date;

  @Field({ nullable: true })
  duration?: number;

  @Field(() => InterviewType)
  type: InterviewType;

  @Field(() => InterviewStatus)
  status: InterviewStatus;

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

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}