import { ObjectType, Field, registerEnumType } from '@nestjs/graphql';

export enum SMSStatus {
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
}

registerEnumType(SMSStatus, {
  name: 'SMSStatus',
});

@ObjectType()
export class SMSResponse {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  messageId?: string;

  @Field({ nullable: true })
  response?: string;

  @Field({ nullable: true })
  error?: string;

  @Field({ nullable: true })
  statusCode?: number;

  @Field(() => SMSStatus, { nullable: true })
  status?: SMSStatus;
}

@ObjectType()
export class SMSBalanceResponse {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  balance?: number;

  @Field({ nullable: true })
  currency?: string;

  @Field({ nullable: true })
  error?: string;
}

@ObjectType()
export class SMSCostEstimation {
  @Field()
  parts: number;

  @Field()
  totalMessages: number;

  @Field()
  estimatedCost: number;

  @Field()
  currency: string;
}

@ObjectType()
export class BulkSMSResponse {
  @Field()
  success: boolean;

  @Field()
  totalRecipients: number;

  @Field({ nullable: true })
  messageId?: string;

  @Field({ nullable: true })
  response?: string;

  @Field({ nullable: true })
  error?: string;

  @Field(() => SMSCostEstimation, { nullable: true })
  costEstimation?: SMSCostEstimation;
}
