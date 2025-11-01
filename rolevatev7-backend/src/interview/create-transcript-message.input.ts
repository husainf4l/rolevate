import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsOptional, IsNumber, Min, Max, IsEnum, IsDateString } from 'class-validator';

export enum SpeakerType {
  AI = 'AI',
  CANDIDATE = 'CANDIDATE',
  SYSTEM = 'SYSTEM'
}

@InputType()
export class CreateTranscriptMessageInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  content: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsEnum(SpeakerType)
  speaker: SpeakerType;

  @Field()
  @IsNotEmpty()
  @IsDateString()
  timestamp: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  confidence?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  language?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sequenceNumber?: number;
}