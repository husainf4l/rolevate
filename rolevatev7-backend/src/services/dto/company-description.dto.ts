import { ObjectType, Field, InputType, Int } from '@nestjs/graphql';
import { IsString, IsOptional, IsInt } from 'class-validator';

@InputType('GenerateDescriptionInput')
export class CompanyDescriptionRequestDto {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  companyName?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  industry?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  location?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  country?: string;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  numberOfEmployees?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  currentDescription?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
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
