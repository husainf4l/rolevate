import { ObjectType, Field, InputType } from '@nestjs/graphql';
import { IsString, IsOptional } from 'class-validator';

@InputType()
export class RequirementsPolishRequestDto {
  @Field()
  @IsString()
  requirements: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  jobTitle?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  industry?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  experienceLevel?: string;
}

@ObjectType()
export class RequirementsPolishResponseDto {
  @Field()
  polishedRequirements: string;

  @Field({ nullable: true })
  suggestions?: string;
}
