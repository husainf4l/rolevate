import { InputType, Field } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { ApplicationStatus } from './application.entity';
import { IsNotEmpty, IsOptional, IsString, IsUrl, IsEnum, IsObject, IsEmail } from 'class-validator';

@InputType()
export class CreateApplicationInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  jobId: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  candidateId: string;

  @Field(() => ApplicationStatus, { nullable: true })
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  coverLetter?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  resumeUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  expectedSalary?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  noticePeriod?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  source?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  @IsObject()
  aiAnalysis?: any;

  @Field({ nullable: true })
  @IsOptional()
  interviewScheduled?: boolean;

  // Additional fields for anonymous applications
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  firstName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  lastName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  portfolioUrl?: string;
}