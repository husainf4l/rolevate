import { InputType, Field, PartialType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';
import { CreateUserInput } from './create-user.input';
import { UserType } from './user.entity';

@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {
  @Field(() => UserType, { nullable: true })
  userType?: UserType;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  avatar?: string;
}