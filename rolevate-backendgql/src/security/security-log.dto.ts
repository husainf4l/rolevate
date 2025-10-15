import { ObjectType, Field, ID } from '@nestjs/graphql';
import { SecurityAction } from './security-log.entity';

@ObjectType()
export class SecurityLogDto {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  userId?: string;

  @Field(() => SecurityAction)
  action: SecurityAction;

  @Field()
  resource: string;

  @Field({ nullable: true })
  resourceId?: string;

  @Field({ nullable: true })
  details?: string;

  @Field({ nullable: true })
  ipAddress?: string;

  @Field({ nullable: true })
  userAgent?: string;

  @Field()
  success: boolean;

  @Field()
  createdAt: Date;
}