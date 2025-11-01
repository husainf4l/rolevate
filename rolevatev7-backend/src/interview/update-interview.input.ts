import { InputType, PartialType } from '@nestjs/graphql';
import { CreateInterviewInput } from './create-interview.input';

@InputType()
export class UpdateInterviewInput extends PartialType(CreateInterviewInput) {
  // All fields from CreateInterviewInput are now optional and properly validated
}