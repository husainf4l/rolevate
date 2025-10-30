import { ObjectType, Field, InputType } from '@nestjs/graphql';
import { IsString, IsOptional } from 'class-validator';

@InputType()
export class JobTitleRewriteRequestDto {
  @Field()
  @IsString()
  currentTitle: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  industry?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  experienceLevel?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  companyType?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  jobTitle?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  company?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  jobLevel?: string;
}

@ObjectType()
export class JobTitleRewriteResponseDto {
  @Field()
  rewrittenTitle: string;

  @Field()
  originalTitle: string;

  @Field()
  department: string;
}
