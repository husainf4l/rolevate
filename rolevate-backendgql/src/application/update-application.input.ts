import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreateApplicationInput } from './create-application.input';
import { ApplicationStatus } from './application.entity';
import { IsOptional, IsEnum } from 'class-validator';

@InputType()
export class UpdateApplicationInput extends PartialType(CreateApplicationInput) {
  @Field(() => ApplicationStatus, { nullable: true })
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;
}