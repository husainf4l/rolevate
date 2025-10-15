import { InputType, Field } from '@nestjs/graphql';
import { SecurityAction } from './security-log.entity';

@InputType()
export class CreateSecurityLogInput {
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

  @Field({ nullable: true })
  success?: boolean;
}