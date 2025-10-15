import { IsEmail, IsString, MinLength, IsEnum, IsOptional, IsPhoneNumber } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';
import { UserRole } from '../user.entity';

@InputType()
export class RegisterInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  @MinLength(8)
  password: string;

  @Field()
  @IsString()
  firstName: string;

  @Field()
  @IsString()
  lastName: string;

  @Field(() => UserRole)
  @IsEnum(UserRole)
  role: UserRole;

  @Field({ nullable: true })
  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string;
}

@InputType()
export class LoginInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  password: string;
}
