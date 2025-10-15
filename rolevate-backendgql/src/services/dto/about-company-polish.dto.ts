import { ObjectType, Field, InputType } from '@nestjs/graphql';

@InputType()
export class AboutCompanyPolishRequestDto {
  @Field()
  aboutCompany: string;

  @Field({ nullable: true })
  industry?: string;

  @Field({ nullable: true })
  companySize?: string;

  @Field({ nullable: true })
  targetAudience?: string;

  @Field({ nullable: true })
  companyName?: string;

  @Field({ nullable: true })
  location?: string;
}

@ObjectType()
export class AboutCompanyPolishResponseDto {
  @Field()
  polishedAboutCompany: string;

  @Field({ nullable: true })
  suggestions?: string;
}
