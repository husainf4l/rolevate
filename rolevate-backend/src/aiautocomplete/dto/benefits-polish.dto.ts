import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class BenefitsPolishRequestDto {
  @IsString()
  @IsNotEmpty()
  benefits: string;

  @IsString()
  @IsOptional()
  industry?: string;

  @IsString()
  @IsOptional()
  jobLevel?: string;

  @IsString()
  @IsOptional()
  company?: string;
}

export class BenefitsPolishResponseDto {
  polishedBenefits: string;
}
