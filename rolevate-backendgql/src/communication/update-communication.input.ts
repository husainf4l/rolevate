import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreateCommunicationInput } from './create-communication.input';
import { CommunicationType } from './communication.entity';

@InputType()
export class UpdateCommunicationInput extends PartialType(CreateCommunicationInput) {
  @Field(() => CommunicationType, { nullable: true })
  type?: CommunicationType;
}