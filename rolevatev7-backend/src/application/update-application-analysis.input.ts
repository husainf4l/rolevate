import { InputType, Field, Int } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { IsString, IsInt, IsOptional, IsObject } from 'class-validator';

@InputType()
export class UpdateApplicationAnalysisInput {
  @Field()
  @IsString()
  applicationId: string;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  cvAnalysisScore?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  cvAnalysisResults?: string; // JSON string

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  aiCvRecommendations?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  aiInterviewRecommendations?: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsObject()
  @IsOptional()
  candidateInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
    githubUrl?: string;
    location?: string;
    bio?: string;
    skills?: string[];
    experience?: any; // Can be string or array of experience objects
    education?: any; // Can be string or array of education objects
  };
}
