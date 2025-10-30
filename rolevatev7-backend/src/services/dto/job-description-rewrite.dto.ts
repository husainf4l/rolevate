import { InputType, ObjectType, Field } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class JobDescriptionRewriteInput {
  @Field()
  @IsString()
  jobDescription: string;
}

@ObjectType()
export class JobDescriptionRewriteResponse {
  @Field()
  rewrittenDescription: string;

  @Field()
  rewrittenShortDescription: string;
}

