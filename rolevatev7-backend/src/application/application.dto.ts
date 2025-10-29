import { ObjectType, Field, ID } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { ApplicationStatus } from './application.entity';

@ObjectType()
export class ApplicationDto {
  @Field(() => ID)
  id: string;

  @Field()
  jobId: string;

  @Field()
  candidateId: string;

  @Field(() => ApplicationStatus)
  status: ApplicationStatus;

  @Field()
  appliedAt: Date;

  @Field({ nullable: true })
  coverLetter?: string;

  @Field({ nullable: true })
  resumeUrl?: string;

  @Field({ nullable: true })
  expectedSalary?: string;

  @Field({ nullable: true })
  noticePeriod?: string;

  @Field({ nullable: true })
  cvAnalysisScore?: number;

  @Field({ nullable: true })
  cvScore?: number;

  @Field({ nullable: true })
  firstInterviewScore?: number;

  @Field({ nullable: true })
  secondInterviewScore?: number;

  @Field({ nullable: true })
  finalScore?: number;

  @Field(() => GraphQLJSONObject, { nullable: true })
  cvAnalysisResults?: any;

  @Field({ nullable: true })
  analyzedAt?: Date;

  @Field({ nullable: true })
  aiCvRecommendations?: string;

  @Field({ nullable: true })
  aiInterviewRecommendations?: string;

  @Field({ nullable: true })
  aiSecondInterviewRecommendations?: string;

  @Field({ nullable: true })
  recommendationsGeneratedAt?: Date;

  @Field({ nullable: true })
  companyNotes?: string;

  @Field({ nullable: true })
  source?: string;

  @Field({ nullable: true })
  notes?: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  aiAnalysis?: any;

  @Field()
  interviewScheduled: boolean;

  @Field({ nullable: true })
  reviewedAt?: Date;

  @Field({ nullable: true })
  interviewScheduledAt?: Date;

  @Field({ nullable: true })
  interviewedAt?: Date;

  @Field({ nullable: true })
  rejectedAt?: Date;

  @Field({ nullable: true })
  acceptedAt?: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class CVAnalysisResultDto {
  @Field()
  score: number;

  @Field()
  summary: string;

  @Field(() => [String])
  strengths: string[];

  @Field(() => [String])
  weaknesses: string[];

  @Field(() => [String])
  recommendations: string[];

  @Field(() => GraphQLJSONObject)
  skillsMatch: {
    matched: string[];
    missing: string[];
    percentage: number;
  };

  @Field(() => GraphQLJSONObject)
  experienceMatch: {
    relevant: boolean;
    years: number;
    details: string;
  };

  @Field(() => GraphQLJSONObject)
  educationMatch: {
    relevant: boolean;
    details: string;
  };

  @Field()
  overallFit: string;
}