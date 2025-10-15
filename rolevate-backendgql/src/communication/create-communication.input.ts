import { InputType, Field } from '@nestjs/graphql';
import { CommunicationType } from './communication.entity';

@InputType()
export class CreateCommunicationInput {
  @Field()
  applicationId: string;

  @Field()
  senderId: string;

  @Field()
  recipientId: string;

  @Field(() => CommunicationType)
  type: CommunicationType;

  @Field({ nullable: true })
  subject?: string;

  @Field()
  message: string;

  @Field({ nullable: true })
  isRead?: boolean;
}