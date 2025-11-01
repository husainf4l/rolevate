import { InputType, Field } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { IsUUID, IsOptional, IsString, IsNumber, IsEnum, IsUrl, IsDateString, Min, Max, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { InterviewType, InterviewStatus } from './interview.entity';
import { CreateTranscriptMessageInput } from './create-transcript-message.input';

@InputType()
export class CreateInterviewInput {
  @Field()
  @IsUUID()
  applicationId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  scheduledAt?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(480) // Max 8 hours
  duration?: number;

  @Field(() => InterviewType, { nullable: true })
  @IsOptional()
  @IsEnum(InterviewType)
  type?: InterviewType;

  @Field(() => InterviewStatus, { nullable: true })
  @IsOptional()
  @IsEnum(InterviewStatus)
  status?: InterviewStatus;

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
  @Max(10)
  rating?: number;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  aiAnalysis?: any;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  recordingUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  roomId?: string;

  @Field(() => [CreateTranscriptMessageInput], { nullable: true })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateTranscriptMessageInput)
  transcriptMessages?: CreateTranscriptMessageInput[];
}