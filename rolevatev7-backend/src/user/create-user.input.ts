import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsEnum, IsOptional, IsString, Matches, MinLength, IsPhoneNumber } from 'class-validator';
import { UserType } from './user.entity';

@InputType()
export class CreateUserInput {
  @Field(() => UserType)
  @IsEnum(UserType)
  userType: UserType;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
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
  name?: string;

  @Field()
  @IsString()
  @IsPhoneNumber(undefined, { message: 'Please provide a valid phone number' })
  phone: string;
}