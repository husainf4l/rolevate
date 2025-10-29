import { InputType, Field } from '@nestjs/graphql';
import { IsString, MinLength, Matches, IsNotEmpty } from 'class-validator';

@InputType()
export class ResetPasswordInput {
  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Reset token is required' })
  token: string;

  @Field()
  @IsString()
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    { message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' }
  )
  newPassword: string;
}
