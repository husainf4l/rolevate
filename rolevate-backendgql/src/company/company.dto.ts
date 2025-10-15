import { ObjectType, Field, ID } from '@nestjs/graphql';
import { CompanySize } from './company.entity';

@ObjectType()
export class CompanyDto {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  website?: string;

  @Field({ nullable: true })
  logo?: string;

  @Field({ nullable: true })
  industry?: string;

  @Field(() => CompanySize, { nullable: true })
  size?: CompanySize;

  @Field({ nullable: true })
  founded?: Date;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  addressId?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}