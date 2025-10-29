import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreateApplicationInput } from './create-application.input';
import { ApplicationStatus } from './application.entity';
import { IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { GraphQLJSONObject } from 'graphql-type-json';

@InputType()
export class UpdateApplicationInput extends PartialType(CreateApplicationInput) {
  @Field(() => ApplicationStatus, { nullable: true })
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  cvAnalysisScore?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  cvScore?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  firstInterviewScore?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  secondInterviewScore?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  finalScore?: number;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  cvAnalysisResults?: any;

  @Field({ nullable: true })
  @IsOptional()
  aiCvRecommendations?: string;

  @Field({ nullable: true })
  @IsOptional()
  aiInterviewRecommendations?: string;

  @Field({ nullable: true })
  @IsOptional()
  aiSecondInterviewRecommendations?: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  aiAnalysis?: any;
}