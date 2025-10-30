import { ObjectType, Field, InputType } from '@nestjs/graphql';
import { IsString, IsOptional } from 'class-validator';

@InputType()
export class ResponsibilitiesPolishRequestDto {
  @Field()
  @IsString()
  responsibilities: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  jobTitle?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  experienceLevel?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  industry?: string;

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
export class ResponsibilitiesPolishResponseDto {
  @Field()
  polishedResponsibilities: string;

  @Field({ nullable: true })
  suggestions?: string;
}

