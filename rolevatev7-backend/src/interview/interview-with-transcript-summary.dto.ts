import { Field, ObjectType, ID } from '@nestjs/graphql';
import { InterviewType, InterviewStatus } from './interview.entity';
import { InterviewTranscriptSummary } from './interview-transcript-summary.dto';

@ObjectType()
export class InterviewWithTranscriptSummary {
  @Field(() => ID)
  id: string;

  @Field()
  applicationId: string;

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

  @Field({ nullable: true })
  recordingUrl?: string;

  @Field({ nullable: true })
  roomId?: string;

  @Field(() => InterviewTranscriptSummary, { nullable: true })
  transcriptSummary?: InterviewTranscriptSummary;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
