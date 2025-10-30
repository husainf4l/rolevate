import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class ApiKeyDto {
  @Field()
  id: string;

  @Field()
  key: string;

  @Field({ nullable: true })
  name?: string;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  expiresAt?: Date;

  @Field()
  userId: string;
}