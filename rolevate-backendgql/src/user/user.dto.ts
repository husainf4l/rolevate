import { ObjectType, Field } from '@nestjs/graphql';
import { UserType } from './user.entity';

@ObjectType()
export class UserDto {
  @Field()
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

  @Field({ nullable: true })
  companyId?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}