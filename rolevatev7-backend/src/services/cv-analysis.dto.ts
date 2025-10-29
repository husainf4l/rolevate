import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class SkillsMatch {
  @Field(() => [String])
  matched: string[];

  @Field(() => [String])
  missing: string[];

  @Field()
  percentage: number;
}

@ObjectType()
export class ExperienceMatch {
  @Field()
  relevant: boolean;

  @Field()
  years: number;

  @Field()
  details: string;
}

@ObjectType()
export class EducationMatch {
  @Field()
  relevant: boolean;

  @Field()
  details: string;
}

@ObjectType()
export class CVAnalysisResult {
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

  @Field(() => SkillsMatch)
  skillsMatch: SkillsMatch;

  @Field(() => ExperienceMatch)
  experienceMatch: ExperienceMatch;

  @Field(() => EducationMatch)
  educationMatch: EducationMatch;

  @Field()
  overallFit: string;
}

@ObjectType()
export class CandidateInfo {
  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  currentJobTitle?: string;

  @Field({ nullable: true })
  currentCompany?: string;

  @Field({ nullable: true })
  totalExperience?: number;

  @Field(() => [String], { nullable: true })
  skills?: string[];

  @Field({ nullable: true })
  education?: string;

  @Field({ nullable: true })
  summary?: string;
}
