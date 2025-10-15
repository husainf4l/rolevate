import { ObjectType, Field } from '@nestjs/graphql';
import { User } from '../user.entity';

@ObjectType()
export class AuthResponse {
  @Field()
  accessToken: string;

  @Field(() => User)
  user: User;
}

@ObjectType()
export class RegisterResponse {
  @Field()
  message: string;

  @Field(() => User)
  user: User;
}
