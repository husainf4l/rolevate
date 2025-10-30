import { ObjectType, Field, registerEnumType } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { NotificationType, NotificationCategory } from './notification.entity';

registerEnumType(NotificationType, {
  name: 'NotificationType',
});

registerEnumType(NotificationCategory, {
  name: 'NotificationCategory',
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

  @Field(() => NotificationCategory)
  category: NotificationCategory;

  @Field()
  read: boolean;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  readAt?: Date;

  @Field()
  userId: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  metadata?: Record<string, any>;
}