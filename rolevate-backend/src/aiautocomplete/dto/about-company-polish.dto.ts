import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class AboutCompanyPolishRequestDto {
  @IsString()
  @IsNotEmpty()
  aboutCompany: string;

  @IsString()
  @IsOptional()
  industry?: string;

  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsOptional()
  companySize?: string;

  @IsString()
  @IsOptional()
  location?: string;
}

export class AboutCompanyPolishResponseDto {
  polishedAboutCompany: string;
}
