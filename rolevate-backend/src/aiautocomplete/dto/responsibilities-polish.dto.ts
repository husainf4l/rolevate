import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class ResponsibilitiesPolishRequestDto {
  @IsString()
  @IsNotEmpty()
  responsibilities: string;

  @IsString()
  @IsOptional()
  industry?: string;

  @IsString()
  @IsOptional()
  jobLevel?: string;

  @IsString()
  @IsOptional()
  jobTitle?: string;

  @IsString()
  @IsOptional()
  company?: string;
}

export class ResponsibilitiesPolishResponseDto {
  polishedResponsibilities: string;
}
