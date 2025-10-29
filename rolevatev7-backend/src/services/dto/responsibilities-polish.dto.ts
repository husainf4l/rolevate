import { ObjectType, Field, InputType } from '@nestjs/graphql';

@InputType()
export class ResponsibilitiesPolishRequestDto {
  @Field()
  responsibilities: string;

  @Field({ nullable: true })
  jobTitle?: string;

  @Field({ nullable: true })
  experienceLevel?: string;

  @Field({ nullable: true })
  industry?: string;

  @Field({ nullable: true })
  jobLevel?: string;

  @Field({ nullable: true })
  company?: string;
}

@ObjectType()
export class ResponsibilitiesPolishResponseDto {
  @Field()
  polishedResponsibilities: string;

  @Field({ nullable: true })
  suggestions?: string;
}
