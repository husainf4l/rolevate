import { InputType, Field, Int } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';

@InputType()
export class UpdateApplicationAnalysisInput {
  @Field()
  applicationId: string;

  @Field(() => Int, { nullable: true })
  cvAnalysisScore?: number;

  @Field({ nullable: true })
  cvAnalysisResults?: string; // JSON string

  @Field({ nullable: true })
  aiCvRecommendations?: string;

  @Field({ nullable: true })
  aiInterviewRecommendations?: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  candidateInfo?: {
    firstName?: string;
    lastName?: string;
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
