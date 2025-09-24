import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsDateString, IsDecimal } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateJobDto {
  @ApiProperty({
    example: 'Senior Software Engineer',
    description: 'Job title in English'
  })
  @IsString()
  title_en: string;

  @ApiProperty({
    example: 'مهندس برمجيات أول',
    description: 'Job title in Arabic'
  })
  @IsString()
  title_ar: string;

  @ApiProperty({
    example: 'We are looking for a senior software engineer...',
    description: 'Job description in English'
  })
  @IsString()
  description_en: string;

  @ApiProperty({
    example: 'نبحث عن مهندس برمجيات أول...',
    description: 'Job description in Arabic'
  })
  @IsString()
  description_ar: string;

  @ApiPropertyOptional({
    example: '5+ years of experience, Bachelor degree...',
    description: 'Job requirements in English'
  })
  @IsOptional()
  @IsString()
  requirements_en?: string;

  @ApiPropertyOptional({
    example: '5+ سنوات من الخبرة، درجة البكالوريوس...',
    description: 'Job requirements in Arabic'
  })
  @IsOptional()
  @IsString()
  requirements_ar?: string;

  @ApiProperty({
    example: 'comp_123',
    description: 'Company ID'
  })
  @IsString()
  companyId: string;

  @ApiPropertyOptional({
    example: 'dept_123',
    description: 'Department ID'
  })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiPropertyOptional({
    example: 'ind_tech',
    description: 'Industry ID'
  })
  @IsOptional()
  @IsString()
  industryId?: string;

  @ApiPropertyOptional({
    example: 'jt_fulltime',
    description: 'Job type ID'
  })
  @IsOptional()
  @IsString()
  typeId?: string;

  @ApiPropertyOptional({
    example: 'jl_senior',
    description: 'Job level ID'
  })
  @IsOptional()
  @IsString()
  levelId?: string;

  @ApiPropertyOptional({
    example: 'loc_remote',
    description: 'Job location ID'
  })
  @IsOptional()
  @IsString()
  locationId?: string;

  @ApiPropertyOptional({
    example: 80000,
    description: 'Minimum salary'
  })
  @IsOptional()
  @Type(() => Number)
  salaryMin?: number;

  @ApiPropertyOptional({
    example: 120000,
    description: 'Maximum salary'
  })
  @IsOptional()
  @Type(() => Number)
  salaryMax?: number;

  @ApiPropertyOptional({
    example: 'USD',
    description: 'Currency code',
    default: 'USD'
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({
    example: '2024-12-31T23:59:59Z',
    description: 'Job closing date'
  })
  @IsOptional()
  @IsDateString()
  closingDate?: string;

  @ApiPropertyOptional({
    example: 5,
    description: 'Required years of experience'
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  experienceYears?: number;

  @ApiPropertyOptional({
    example: 'Bachelor',
    description: 'Required education level'
  })
  @IsOptional()
  @IsString()
  educationLevel?: string;
}

export class UpdateJobDto {
  @ApiPropertyOptional({ example: 'Senior Software Engineer' })
  @IsOptional()
  @IsString()
  title_en?: string;

  @ApiPropertyOptional({ example: 'مهندس برمجيات أول' })
  @IsOptional()
  @IsString()
  title_ar?: string;

  @ApiPropertyOptional({ example: 'We are looking for...' })
  @IsOptional()
  @IsString()
  description_en?: string;

  @ApiPropertyOptional({ example: 'نبحث عن...' })
  @IsOptional()
  @IsString()
  description_ar?: string;

  @ApiPropertyOptional({ example: '5+ years of experience...' })
  @IsOptional()
  @IsString()
  requirements_en?: string;

  @ApiPropertyOptional({ example: '5+ سنوات من الخبرة...' })
  @IsOptional()
  @IsString()
  requirements_ar?: string;

  @ApiPropertyOptional({ example: 'js_published', description: 'Job status ID' })
  @IsOptional()
  @IsString()
  statusId?: string;

  @ApiPropertyOptional({ example: '2024-12-31T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  closingDate?: string;
}

export class JobResponseDto {
  @ApiProperty({ example: 'job_123' })
  id: string;

  @ApiProperty({ example: 'Senior Software Engineer' })
  title_en: string;

  @ApiProperty({ example: 'مهندس برمجيات أول' })
  title_ar: string;

  @ApiProperty({ example: 'We are looking for...' })
  description_en: string;

  @ApiProperty({ example: 'نبحث عن...' })
  description_ar: string;

  @ApiPropertyOptional({ example: '5+ years of experience...' })
  requirements_en?: string;

  @ApiPropertyOptional({ example: '5+ سنوات من الخبرة...' })
  requirements_ar?: string;

  @ApiProperty({ example: 'comp_123' })
  companyId: string;

  @ApiPropertyOptional({ example: 'dept_123' })
  departmentId?: string;

  @ApiPropertyOptional({ example: 80000 })
  salaryMin?: number;

  @ApiPropertyOptional({ example: 120000 })
  salaryMax?: number;

  @ApiPropertyOptional({ example: 'USD' })
  currency?: string;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  postedDate: Date;

  @ApiPropertyOptional({ example: '2024-12-31T23:59:59Z' })
  closingDate?: Date;

  @ApiPropertyOptional({ example: 5 })
  experienceYears?: number;

  @ApiPropertyOptional({ example: 'Bachelor' })
  educationLevel?: string;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  updatedAt: Date;
}