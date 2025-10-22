import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Country } from '@prisma/client';

export class AddressDto {
  @ApiPropertyOptional({
    description: 'Street address',
    example: '123 Business Street'
  })
  @IsString()
  @IsOptional()
  street?: string;

  @ApiPropertyOptional({
    description: 'City',
    example: 'Dubai'
  })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({
    description: 'Country',
    enum: Country,
    example: 'AE'
  })
  @IsEnum(Country)
  country: Country;
}
