import { IsString, IsEmail, IsOptional, IsUrl, IsEnum, IsInt, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AddressDto } from './address.dto';

export class CreateCompanyDto {
  @ApiProperty({
    description: 'Company name',
    example: 'TechCorp Inc.'
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Company description',
    example: 'Leading technology company focused on innovation and growth.'
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'How the company name should be pronounced/spelled',
    example: 'Tech-Corp'
  })
  @IsString()
  @IsOptional()
  spelling?: string; // Optional: How the company name should be pronounced/spelled

  @ApiPropertyOptional({
    description: 'Company email address',
    example: 'contact@techcorp.com'
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'Company phone number',
    example: '+971-50-123-4567'
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Company address',
    type: AddressDto
  })
  @ValidateNested()
  @Type(() => AddressDto)
  @IsOptional()
  address?: AddressDto;

  @ApiPropertyOptional({
    description: 'Company website URL',
    example: 'https://techcorp.com'
  })
  @IsUrl()
  @IsOptional()
  website?: string;

  @ApiPropertyOptional({
    description: 'Company industry',
    enum: ['TECHNOLOGY', 'HEALTHCARE', 'FINANCE', 'EDUCATION', 'MANUFACTURING', 'RETAIL', 'CONSTRUCTION', 'TRANSPORTATION', 'HOSPITALITY', 'CONSULTING', 'MARKETING', 'REAL_ESTATE', 'MEDIA', 'AGRICULTURE', 'ENERGY', 'GOVERNMENT', 'NON_PROFIT', 'OTHER'],
    example: 'TECHNOLOGY'
  })
  @IsEnum(['TECHNOLOGY', 'HEALTHCARE', 'FINANCE', 'EDUCATION', 'MANUFACTURING', 'RETAIL', 'CONSTRUCTION', 'TRANSPORTATION', 'HOSPITALITY', 'CONSULTING', 'MARKETING', 'REAL_ESTATE', 'MEDIA', 'AGRICULTURE', 'ENERGY', 'GOVERNMENT', 'NON_PROFIT', 'OTHER'])
  @IsOptional()
  industry?: string;

  @ApiPropertyOptional({
    description: 'Number of employees',
    example: 50,
    minimum: 1
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  numberOfEmployees?: number;

  // Flat address fields for convenience
  @ApiPropertyOptional({
    description: 'Street address (alternative to address object)',
    example: '123 Business Street'
  })
  @IsString()
  @IsOptional()
  street?: string;

  @ApiPropertyOptional({
    description: 'City (alternative to address object)',
    example: 'Dubai'
  })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({
    description: 'Country (alternative to address object)',
    example: 'AE'
  })
  @IsString()
  @IsOptional()
  country?: string;

  // Company size as string for convenience
  @ApiPropertyOptional({
    description: 'Company size description',
    example: '51-200 employees'
  })
  @IsString()
  @IsOptional()
  size?: string;
}

export class JoinCompanyDto {
  @ApiProperty({
    description: 'Invitation code to join the company',
    example: 'ABC123XYZ'
  })
  @IsString()
  invitationCode: string;
}

export class UpdateCompanyDto {
  @ApiPropertyOptional({
    description: 'Company name',
    example: 'TechCorp Solutions'
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Company description',
    example: 'Leading technology solutions provider'
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'How the company name should be pronounced/spelled',
    example: 'Tech-Corp'
  })
  @IsString()
  @IsOptional()
  spelling?: string; // Optional: How the company name should be pronounced/spelled

  @ApiPropertyOptional({
    description: 'Company email address',
    example: 'contact@techcorp.com'
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'Company phone number',
    example: '+971501234567'
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Company address object',
    type: AddressDto
  })
  @ValidateNested()
  @Type(() => AddressDto)
  @IsOptional()
  address?: AddressDto;

  @ApiPropertyOptional({
    description: 'Company website URL',
    example: 'https://techcorp.com'
  })
  @IsUrl()
  @IsOptional()
  website?: string;

  @ApiPropertyOptional({
    description: 'Company industry',
    enum: ['TECHNOLOGY', 'HEALTHCARE', 'FINANCE', 'EDUCATION', 'MANUFACTURING', 'RETAIL', 'CONSTRUCTION', 'TRANSPORTATION', 'HOSPITALITY', 'CONSULTING', 'MARKETING', 'REAL_ESTATE', 'MEDIA', 'AGRICULTURE', 'ENERGY', 'GOVERNMENT', 'NON_PROFIT', 'OTHER'],
    example: 'TECHNOLOGY'
  })
  @IsEnum(['TECHNOLOGY', 'HEALTHCARE', 'FINANCE', 'EDUCATION', 'MANUFACTURING', 'RETAIL', 'CONSTRUCTION', 'TRANSPORTATION', 'HOSPITALITY', 'CONSULTING', 'MARKETING', 'REAL_ESTATE', 'MEDIA', 'AGRICULTURE', 'ENERGY', 'GOVERNMENT', 'NON_PROFIT', 'OTHER'])
  @IsOptional()
  industry?: string;

  @ApiPropertyOptional({
    description: 'Number of employees',
    example: 150,
    minimum: 1
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  numberOfEmployees?: number;

  // Flat address fields for convenience
  @ApiPropertyOptional({
    description: 'Street address (alternative to address object)',
    example: '123 Business Street'
  })
  @IsString()
  @IsOptional()
  street?: string;

  @ApiPropertyOptional({
    description: 'City (alternative to address object)',
    example: 'Dubai'
  })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({
    description: 'Country (alternative to address object)',
    example: 'AE'
  })
  @IsString()
  @IsOptional()
  country?: string;

  // Company size as string for convenience
  @ApiPropertyOptional({
    description: 'Company size description',
    example: '51-200 employees'
  })
  @IsString()
  @IsOptional()
  size?: string;
}
