import { ObjectType, Field, InputType } from '@nestjs/graphql';

@InputType()
export class SalaryRecommendationRequestDto {
  @Field()
  jobTitle: string;

  @Field({ nullable: true })
  experience?: string;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  industry?: string;

  @Field({ nullable: true })
  companySize?: string;

  @Field({ nullable: true })
  skills?: string;

  @Field({ nullable: true })
  department?: string;

  @Field({ nullable: true })
  employeeType?: string;

  @Field({ nullable: true })
  jobLevel?: string;

  @Field({ nullable: true })
  workType?: string;

  @Field({ nullable: true })
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
