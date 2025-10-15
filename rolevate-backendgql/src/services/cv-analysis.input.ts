import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class AnalyzeCVInput {
  @Field()
  resumeUrl: string;

  @Field({ nullable: true })
  analysisPrompt?: string;

  @Field()
  jobId: string;
}

@InputType()
export class ParseCVInput {
  @Field()
  cvUrl: string;
}

@InputType()
export class GenerateRecommendationsInput {
  @Field()
  prompt: string;
}
