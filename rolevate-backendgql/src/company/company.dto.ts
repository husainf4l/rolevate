import { ObjectType, Field, ID } from '@nestjs/graphql';
import { UserType } from '../user/user.entity';

@ObjectType()
export class CompanyUserDto {
  @Field(() => ID)
  id: string;

  @Field(() => UserType)
  userType: UserType;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  avatar?: string;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

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
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  logo?: string;

  @Field({ nullable: true })
  industry?: string;

  @Field({ nullable: true })
  size?: string;

  @Field({ nullable: true })
  founded?: Date;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  addressId?: string;

  @Field(() => [CompanyUserDto], { nullable: true })
  users?: CompanyUserDto[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}