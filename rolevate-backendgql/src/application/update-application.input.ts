import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreateApplicationInput } from './create-application.input';
import { ApplicationStatus } from './application.entity';

@InputType()
export class UpdateApplicationInput extends PartialType(CreateApplicationInput) {
  @Field(() => ApplicationStatus, { nullable: true })
  status?: ApplicationStatus;
}