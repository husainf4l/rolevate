import { ObjectType, Field, InputType } from '@nestjs/graphql';

@InputType()
export class JobAnalysisInput {
  @Field()
  jobTitle: string;

  @Field({ nullable: true })
  department?: string;

  @Field({ nullable: true })
  industry?: string;

  @Field({ nullable: true })
  employeeType?: string;

  @Field({ nullable: true })
  jobLevel?: string;

  @Field({ nullable: true })
  workType?: string;

  @Field()
  location: string;

  @Field({ nullable: true })
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
