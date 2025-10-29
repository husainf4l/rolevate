import { ObjectType, Field, InputType } from '@nestjs/graphql';

@InputType()
export class RequirementsPolishRequestDto {
  @Field()
  requirements: string;

  @Field({ nullable: true })
  jobTitle?: string;

  @Field({ nullable: true })
  industry?: string;

  @Field({ nullable: true })
  experienceLevel?: string;
}

@ObjectType()
export class RequirementsPolishResponseDto {
  @Field()
  polishedRequirements: string;

  @Field({ nullable: true })
  suggestions?: string;
}
