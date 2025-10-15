import { InputType, Field } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';

@InputType()
export class CreateSecurityLogInput {
  @Field()
  type: string; // AUTH_FAILURE, UNAUTHORIZED_ACCESS, etc.

  @Field({ nullable: true })
  userId?: string;

  @Field()
  ipHash: string; // Hashed IP for privacy

  @Field({ nullable: true })
  userAgentHash?: string; // Hashed user agent

  @Field(() => GraphQLJSONObject)
  details: Record<string, any>; // Additional event details

  @Field()
  severity: string; // LOW, MEDIUM, HIGH, CRITICAL
}