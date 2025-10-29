import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsOptional, IsNumber, Min, Max, IsObject } from 'class-validator';
import { GraphQLJSONObject } from 'graphql-type-json';

@InputType()
export class SubmitInterviewFeedbackInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  interviewId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  feedback?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  @IsObject()
  aiAnalysis?: any;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  recordingUrl?: string;
}
