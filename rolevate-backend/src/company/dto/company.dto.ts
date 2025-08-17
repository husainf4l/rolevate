import { IsString, IsEmail, IsOptional, IsUrl, IsEnum, IsInt, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AddressDto } from './address.dto';

export class CreateCompanyDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  spelling?: string; // Optional: How the company name should be pronounced/spelled

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @ValidateNested()
  @Type(() => AddressDto)
  @IsOptional()
  address?: AddressDto;

  @IsUrl()
  @IsOptional()
  website?: string;

  @IsEnum(['TECHNOLOGY', 'HEALTHCARE', 'FINANCE', 'EDUCATION', 'MANUFACTURING', 'RETAIL', 'CONSTRUCTION', 'TRANSPORTATION', 'HOSPITALITY', 'CONSULTING', 'MARKETING', 'REAL_ESTATE', 'MEDIA', 'AGRICULTURE', 'ENERGY', 'GOVERNMENT', 'NON_PROFIT', 'OTHER'])
  @IsOptional()
  industry?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  numberOfEmployees?: number;

  // Flat address fields for convenience
  @IsString()
  @IsOptional()
  street?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  country?: string;

  // Company size as string for convenience
  @IsString()
  @IsOptional()
  size?: string;
}

export class JoinCompanyDto {
  @IsString()
  invitationCode: string;
}

export class UpdateCompanyDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  spelling?: string; // Optional: How the company name should be pronounced/spelled

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @ValidateNested()
  @Type(() => AddressDto)
  @IsOptional()
  address?: AddressDto;

  @IsUrl()
  @IsOptional()
  website?: string;

  @IsEnum(['TECHNOLOGY', 'HEALTHCARE', 'FINANCE', 'EDUCATION', 'MANUFACTURING', 'RETAIL', 'CONSTRUCTION', 'TRANSPORTATION', 'HOSPITALITY', 'CONSULTING', 'MARKETING', 'REAL_ESTATE', 'MEDIA', 'AGRICULTURE', 'ENERGY', 'GOVERNMENT', 'NON_PROFIT', 'OTHER'])
  @IsOptional()
  industry?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  numberOfEmployees?: number;

  // Flat address fields for convenience
  @IsString()
  @IsOptional()
  street?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  country?: string;

  // Company size as string for convenience
  @IsString()
  @IsOptional()
  size?: string;
}
