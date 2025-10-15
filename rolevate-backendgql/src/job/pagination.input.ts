import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class PaginationInput {
  @Field(() => Int, { nullable: true, defaultValue: 0 })
  skip?: number;

  @Field(() => Int, { nullable: true, defaultValue: 10 })
  take?: number;
}