import { ObjectType, Field, InputType } from '@nestjs/graphql';
import { IsString, IsOptional } from 'class-validator';

@InputType()
export class AboutCompanyPolishRequestDto {
  @Field()
  @IsString()
  aboutCompany: string;

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
  targetAudience?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  companyName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  location?: string;
}

@ObjectType()
export class AboutCompanyPolishResponseDto {
  @Field()
  polishedAboutCompany: string;

  @Field({ nullable: true })
  suggestions?: string;
}
