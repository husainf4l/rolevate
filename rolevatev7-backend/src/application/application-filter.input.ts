import { InputType, Field } from '@nestjs/graphql';
import { ApplicationStatus } from './application.entity';
import { IsOptional, IsEnum, IsString, IsArray } from 'class-validator';

@InputType()
export class ApplicationFilterInput {
  @Field(() => ApplicationStatus, { nullable: true })
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  jobId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  candidateId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  source?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;
}

@InputType()
export class ApplicationPaginationInput {
  @Field({ nullable: true, defaultValue: 1 })
  @IsOptional()
  page?: number = 1;

  @Field({ nullable: true, defaultValue: 10 })
  @IsOptional()
  limit?: number = 10;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
