import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';

@InputType()
export class CreateTranscriptInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  interviewId: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  content: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  speaker: string;

  @Field()
  @IsNotEmpty()
  timestamp: Date;

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
}
