import { IsString, IsEmail, IsOptional, IsUrl, IsEnum, IsInt, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AddressDto } from './address.dto';

export class CreateCompanyDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

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
}

export class JoinCompanyDto {
  @IsString()
  invitationCode: string;
}
