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
}

export class JobDescriptionRewriteResponseDto {
  rewrittenDescription: string;
}
