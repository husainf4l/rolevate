import { IsString, IsOptional, IsEnum } from 'class-validator';
import { Country } from '@prisma/client';

export class AddressDto {
  @IsString()
  @IsOptional()
  street?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsEnum(Country)
  country: Country;
}
