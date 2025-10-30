import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsEnum, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { UserType } from './user.entity';
import { SanitizeEmail, TrimString } from '../common/decorators/sanitize.decorator';

@InputType()
export class CreateUserInput {
  @Field(() => UserType)
  @IsEnum(UserType)
  userType: UserType;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  @SanitizeEmail()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @TrimString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @TrimString()
  phone?: string;
}