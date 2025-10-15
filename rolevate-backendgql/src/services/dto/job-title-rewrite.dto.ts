import { ObjectType, Field, InputType } from '@nestjs/graphql';

@InputType()
export class JobTitleRewriteRequestDto {
  @Field()
  currentTitle: string;

  @Field({ nullable: true })
  industry?: string;

  @Field({ nullable: true })
  experienceLevel?: string;

  @Field({ nullable: true })
  companyType?: string;

  @Field({ nullable: true })
  jobTitle?: string;

  @Field({ nullable: true })
  company?: string;

  @Field({ nullable: true })
  jobLevel?: string;
}

@ObjectType()
export class JobTitleRewriteResponseDto {
  @Field()
  jobTitle: string;

  @Field()
  department: string;
}
