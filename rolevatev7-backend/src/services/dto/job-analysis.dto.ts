import { ObjectType, Field, InputType } from '@nestjs/graphql';
import { IsString, IsOptional } from 'class-validator';

@InputType()
export class JobAnalysisInput {
  @Field()
  @IsString()
  jobTitle: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  department?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  industry?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  employeeType?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  jobLevel?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  workType?: string;

  @Field()
  @IsString()
  location: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  country?: string;
}

@ObjectType()
export class JobAnalysisResponse {
  @Field()
  description: string;

  @Field()
  shortDescription: string;

  @Field()
  responsibilities: string;

  @Field()
  requirements: string;

  @Field()
  benefits: string;

  @Field(() => [String])
  skills: string[];

  @Field()
  suggestedSalary: string;

  @Field()
  experienceLevel: string;

  @Field()
  educationLevel: string;
}
