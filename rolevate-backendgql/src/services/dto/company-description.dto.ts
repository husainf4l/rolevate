import { ObjectType, Field, InputType } from '@nestjs/graphql';

@InputType()
export class CompanyDescriptionRequestDto {
  @Field()
  companyName: string;

  @Field({ nullable: true })
  industry?: string;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  country?: string;

  @Field({ nullable: true })
  numberOfEmployees?: string;

  @Field({ nullable: true })
  currentDescription?: string;

  @Field({ nullable: true })
  website?: string;
}

@ObjectType()
export class CompanyDescriptionResponseDto {
  @Field({ nullable: true })
  description?: string;

  @Field()
  generatedDescription: string;

  @Field({ nullable: true })
  suggestions?: string;
}
