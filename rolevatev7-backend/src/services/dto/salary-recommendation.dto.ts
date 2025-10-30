import { ObjectType, Field, InputType } from '@nestjs/graphql';
import { IsString, IsOptional } from 'class-validator';

@InputType()
export class SalaryRecommendationRequestDto {
  @Field()
  @IsString()
  jobTitle: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  experience?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  location?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  industry?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  companySize?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  skills?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  department?: string;

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

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  country?: string;
}

@ObjectType()
export class SalaryRangeDto {
  @Field()
  min: number;

  @Field()
  max: number;

  @Field()
  currency: string;

  @Field()
  period: string;
}

@ObjectType()
export class JobRequirementsDto {
  @Field()
  description: string;

  @Field()
  shortDescription: string;

  @Field()
  keyResponsibilities: string;

  @Field(() => [String])
  qualifications: string[];

  @Field(() => [String])
  requiredSkills: string[];

  @Field(() => [String])
  benefitsAndPerks: string[];
}

@ObjectType()
export class SalarySourceDto {
  @Field()
  name: string;

  @Field()
  url: string;

  @Field()
  methodology: string;

  @Field()
  dataPoints: number;

  @Field()
  lastUpdated: string;

  @Field()
  region: string;

  @Field(() => SalaryRangeDto)
  salaryRange: SalaryRangeDto;
}

@ObjectType()
export class SalaryRecommendationResponseDto {
  @Field()
  jobTitle: string;

  @Field({ nullable: true })
  department?: string;

  @Field({ nullable: true })
  industry?: string;

  @Field()
  location: string;

  @Field({ nullable: true })
  workType?: string;

  @Field(() => SalaryRangeDto)
  salaryRange: SalaryRangeDto;

  @Field()
  averageSalary: number;

  @Field()
  salaryMethodology: string;

  @Field(() => JobRequirementsDto)
  jobRequirements: JobRequirementsDto;

  @Field()
  experienceLevel: string;

  @Field(() => [String])
  educationRequirements: string[];

  @Field(() => [SalarySourceDto])
  sources: SalarySourceDto[];

  @Field(() => [String])
  insights: string[];

  @Field()
  lastUpdated: string;

  @Field()
  disclaimer: string;
}

