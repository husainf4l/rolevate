import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class InterviewTranscriptSummary {
  @Field()
  totalTranscripts: number;

  @Field(() => [String])
  speakers: string[];

  @Field()
  duration: number;

  @Field()
  language: string;
}
