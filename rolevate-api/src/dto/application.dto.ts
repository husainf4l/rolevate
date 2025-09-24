import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUrl } from 'class-validator';

export class CreateApplicationDto {
  @ApiProperty({
    example: 'job_123',
    description: 'Job ID to apply for'
  })
  @IsString()
  jobId: string;

  @ApiProperty({
    example: 'user_123',
    description: 'Candidate user ID'
  })
  @IsString()
  candidateId: string;

  @ApiPropertyOptional({
    example: 'I am excited to apply for this position...',
    description: 'Cover letter text'
  })
  @IsOptional()
  @IsString()
  coverLetter?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/resume.pdf',
    description: 'URL to resume file'
  })
  @IsOptional()
  @IsUrl()
  resume?: string;
}

export class UpdateApplicationDto {
  @ApiPropertyOptional({
    example: 'as_shortlisted',
    description: 'Application status ID'
  })
  @IsOptional()
  @IsString()
  statusId?: string;

  @ApiPropertyOptional({
    example: 'Strong technical skills, good cultural fit',
    description: 'Notes about the application'
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    example: 'Candidate showed excellent problem-solving abilities',
    description: 'Feedback on the application'
  })
  @IsOptional()
  @IsString()
  feedback?: string;

  @ApiPropertyOptional({
    example: 'user_456',
    description: 'ID of the user who reviewed the application'
  })
  @IsOptional()
  @IsString()
  reviewedBy?: string;
}

export class ApplicationResponseDto {
  @ApiProperty({ example: 'app_123' })
  id: string;

  @ApiProperty({ example: 'user_123' })
  candidateId: string;

  @ApiProperty({ example: 'job_123' })
  jobId: string;

  @ApiPropertyOptional({ example: 'I am excited to apply...' })
  coverLetter?: string;

  @ApiPropertyOptional({ example: 'https://example.com/resume.pdf' })
  resume?: string;

  @ApiPropertyOptional({ example: 'as_under_review' })
  statusId?: string;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  appliedAt: Date;

  @ApiPropertyOptional({ example: '2024-01-16T14:30:00Z' })
  reviewedAt?: Date;

  @ApiPropertyOptional({ example: 'user_456' })
  reviewedBy?: string;

  @ApiPropertyOptional({ example: 'Strong candidate, proceed to interview' })
  notes?: string;

  @ApiPropertyOptional({ example: 'Excellent technical skills' })
  feedback?: string;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  updatedAt: Date;
}