import { ObjectType, Field, InputType } from '@nestjs/graphql';
import { IsString, IsOptional } from 'class-validator';

@InputType()
export class BenefitsPolishRequestDto {
  @Field()
  @IsString()
  benefits: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  industry?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  companySize?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  location?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  jobLevel?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  company?: string;
}

@ObjectType()
export class BenefitsPolishResponseDto {
  @Field()
  polishedBenefits: string;

  @Field({ nullable: true })
  suggestions?: string;
}

