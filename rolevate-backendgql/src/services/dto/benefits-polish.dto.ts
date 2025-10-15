import { ObjectType, Field, InputType } from '@nestjs/graphql';

@InputType()
export class BenefitsPolishRequestDto {
  @Field()
  benefits: string;

  @Field({ nullable: true })
  industry?: string;

  @Field({ nullable: true })
  companySize?: string;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  jobLevel?: string;

  @Field({ nullable: true })
  company?: string;
}

@ObjectType()
export class BenefitsPolishResponseDto {
  @Field()
  polishedBenefits: string;

  @Field({ nullable: true })
  suggestions?: string;
}
