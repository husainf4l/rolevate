import { IsString, IsEnum, IsOptional, IsInt, Min } from 'class-validator';

export class CompanyDescriptionRequestDto {
  @IsString()
  @IsOptional()
  industry?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  numberOfEmployees?: number;

  @IsString()
  @IsOptional()
  currentDescription?: string;
}

export class CompanyDescriptionResponseDto {
  @IsString()
  generatedDescription: string;
}