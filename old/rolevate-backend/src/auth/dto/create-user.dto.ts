import { IsEmail, IsString, IsOptional, IsEnum, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    format: 'email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password (minimum 6 characters)',
    example: 'password123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({
    description: 'User display name',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Type of user account',
    enum: ['SYSTEM', 'COMPANY', 'CANDIDATE'],
    example: 'CANDIDATE',
  })
  @IsEnum(['SYSTEM', 'COMPANY', 'CANDIDATE'])
  userType: 'SYSTEM' | 'COMPANY' | 'CANDIDATE';

  @ApiPropertyOptional({
    description: 'User phone number',
    example: '+1234567890',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Company invitation code (for company users)',
    example: 'INVITE123',
  })
  @IsOptional()
  @IsString()
  invitationCode?: string; // Optional company invitation code
}
