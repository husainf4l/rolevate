import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class JobDescriptionRewriteRequestDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  jobDescription?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  shortDescription?: string;
}

export class JobDescriptionRewriteResponseDto {
  rewrittenDescription: string;
  rewrittenShortDescription: string;
}
