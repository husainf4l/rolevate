import { InputType, Field } from '@nestjs/graphql';
import { IsString, MinLength, Matches } from 'class-validator';

@InputType()
export class ChangePasswordInput {
  @Field()
  @IsString()
  @MinLength(6, { message: 'Current password must be at least 6 characters long' })
  currentPassword: string;

  @Field()
  @IsString()
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    { message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' }
  )
  newPassword: string;
}