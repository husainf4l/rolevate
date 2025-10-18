import { ObjectType, Field, InputType } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

@InputType()
export class AIConfigInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  jobTitle: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  department: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  industry: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  jobLevel: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  responsibilities?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  requirements?: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  skills?: string[];

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  interviewLanguage?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  interviewQuestions?: string;
}

@ObjectType()
export class AIConfigResponse {
  @Field()
  aiCvAnalysisPrompt: string;

  @Field()
  aiFirstInterviewPrompt: string;

  @Field()
  aiSecondInterviewPrompt: string;
}
