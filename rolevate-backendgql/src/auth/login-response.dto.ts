import { ObjectType, Field } from '@nestjs/graphql';
import { UserDto } from '../user/user.dto';

@ObjectType()
export class LoginResponseDto {
  @Field()
  access_token: string;

  @Field(() => UserDto)
  user: UserDto;
}