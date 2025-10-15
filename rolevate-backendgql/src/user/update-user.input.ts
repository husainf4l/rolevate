import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreateUserInput } from './create-user.input';
import { UserType } from './user.entity';

@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {
  @Field(() => UserType, { nullable: true })
  userType?: UserType;
}