import { ObjectType, Field, Int } from '@nestjs/graphql';
import { NotificationDto } from './notification.dto';

@ObjectType()
export class NotificationListDto {
  @Field(() => [NotificationDto])
  notifications: NotificationDto[];

  @Field(() => Int)
  total: number;
}