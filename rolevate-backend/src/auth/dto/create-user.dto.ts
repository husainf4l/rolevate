import { IsEmail, IsString, IsOptional, IsEnum, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsEnum(['SYSTEM', 'COMPANY', 'CANDIDATE'])
  userType: 'SYSTEM' | 'COMPANY' | 'CANDIDATE';

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  invitationCode?: string; // Optional company invitation code
}
