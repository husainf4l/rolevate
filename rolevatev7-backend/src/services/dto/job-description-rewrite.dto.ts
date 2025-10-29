import { InputType, ObjectType, Field } from '@nestjs/graphql';

@InputType()
export class JobDescriptionRewriteInput {
  @Field()
  jobDescription: string;
}

@ObjectType()
export class JobDescriptionRewriteResponse {
  @Field()
  rewrittenDescription: string;

  @Field()
  rewrittenShortDescription: string;
}
