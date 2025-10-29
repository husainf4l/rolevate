import { ObjectType, Field, ID } from '@nestjs/graphql';
import { CommunicationType } from './communication.entity';

@ObjectType()
export class CommunicationDto {
  @Field(() => ID)
  id: string;

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

  @Field()
  isRead: boolean;

  @Field()
  sentAt: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}