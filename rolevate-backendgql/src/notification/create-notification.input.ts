import { InputType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { IsString, IsNotEmpty, IsEnum, IsOptional, IsObject, IsNumber } from 'class-validator';
import { NotificationType, NotificationCategory } from './notification.entity';

registerEnumType(NotificationType, {
  name: 'NotificationType',
});

registerEnumType(NotificationCategory, {
  name: 'NotificationCategory',
});

@InputType()
export class CreateNotificationInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  message: string;

  @Field(() => NotificationType)
  @IsEnum(NotificationType)
  type: NotificationType;

  @Field(() => NotificationCategory)
  @IsEnum(NotificationCategory)
  category: NotificationCategory;

  @Field()
  @IsString()
  userId: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}