import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class JobTitleRewriteRequestDto {
  @IsString()
  @IsNotEmpty()
  jobTitle: string;

  @IsString()
  @IsOptional()
  industry?: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsString()
  @IsOptional()
  jobLevel?: string;
}

export class JobTitleRewriteResponseDto {
  jobTitle: string;
  department: string;
}
