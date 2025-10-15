import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { NotificationType } from './notification.entity';

registerEnumType(NotificationType, {
  name: 'NotificationType',
});

@ObjectType()
export class NotificationDto {
  @Field()
  id: string;

  @Field()
  title: string;

  @Field()
  message: string;

  @Field(() => NotificationType)
  type: NotificationType;

  @Field()
  isRead: boolean;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  readAt?: Date;

  @Field()
  userId: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  metadata?: Record<string, any>;
}