import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreateInterviewInput } from './create-interview.input';
import { InterviewType, InterviewStatus } from './interview.entity';

@InputType()
export class UpdateInterviewInput extends PartialType(CreateInterviewInput) {
  @Field(() => InterviewType, { nullable: true })
  type?: InterviewType;

  @Field(() => InterviewStatus, { nullable: true })
  status?: InterviewStatus;
}