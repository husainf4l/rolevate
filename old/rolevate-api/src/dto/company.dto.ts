import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsEmail, IsUrl } from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({
    example: 'Rolevate Inc',
    description: 'Company name in English'
  })
  @IsString()
  name_en: string;

  @ApiProperty({
    example: 'روليفيت',
    description: 'Company name in Arabic'
  })
  @IsString()
  name_ar: string;

  @ApiProperty({
    example: 'ROLEVATE',
    description: 'Unique company code'
  })
  @IsString()
  code: string;

  @ApiPropertyOptional({
    example: 'Leading recruitment platform',
    description: 'Company description'
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 'contact@rolevate.com'
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: '+1234567890'
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    example: 'https://www.rolevate.com'
  })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({
    example: '123 Business St'
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    example: 'New York'
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    example: 'USA'
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({
    example: 'size_medium',
    description: 'Company size ID'
  })
  @IsOptional()
  @IsString()
  sizeId?: string;

  @ApiPropertyOptional({
    example: 'ind_tech',
    description: 'Industry ID'
  })
  @IsOptional()
  @IsString()
  industryId?: string;
}

export class UpdateCompanyDto {
  @ApiPropertyOptional({ example: 'Rolevate Inc' })
  @IsOptional()
  @IsString()
  name_en?: string;

  @ApiPropertyOptional({ example: 'روليفيت' })
  @IsOptional()
  @IsString()
  name_ar?: string;

  @ApiPropertyOptional({ example: 'Leading recruitment platform' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'contact@rolevate.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'https://www.rolevate.com' })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({ example: 'https://example.com/logo.png' })
  @IsOptional()
  @IsUrl()
  logo?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CompanyResponseDto {
  @ApiProperty({ example: 'comp_123' })
  id: string;

  @ApiProperty({ example: 'Rolevate Inc' })
  name_en: string;

  @ApiProperty({ example: 'روليفيت' })
  name_ar: string;

  @ApiProperty({ example: 'ROLEVATE' })
  code: string;

  @ApiPropertyOptional({ example: 'Leading recruitment platform' })
  description?: string;

  @ApiPropertyOptional({ example: 'contact@rolevate.com' })
  email?: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  phone?: string;

  @ApiPropertyOptional({ example: 'https://www.rolevate.com' })
  website?: string;

  @ApiPropertyOptional({ example: 'https://example.com/logo.png' })
  logo?: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiPropertyOptional({ example: '123 Business St' })
  address?: string;

  @ApiPropertyOptional({ example: 'New York' })
  city?: string;

  @ApiPropertyOptional({ example: 'USA' })
  country?: string;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  updatedAt: Date;
}