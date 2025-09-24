import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsDateString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInterviewDto {
  @ApiProperty({
    example: 'app_123',
    description: 'Application ID'
  })
  @IsString()
  applicationId: string;

  @ApiProperty({
    example: 'job_123',
    description: 'Job ID'
  })
  @IsString()
  jobId: string;

  @ApiPropertyOptional({
    example: 'it_video',
    description: 'Interview type ID'
  })
  @IsOptional()
  @IsString()
  typeId?: string;

  @ApiProperty({
    example: '2024-01-20T14:00:00Z',
    description: 'Scheduled date and time'
  })
  @IsDateString()
  scheduledAt: string;

  @ApiPropertyOptional({
    example: 60,
    description: 'Duration in minutes'
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  duration?: number;

  @ApiPropertyOptional({
    example: 'https://meet.google.com/abc-defg-hij',
    description: 'Physical location or meeting link'
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    example: 'emp_123',
    description: 'Employee ID conducting the interview'
  })
  @IsString()
  conductorId: string;
}

export class UpdateInterviewDto {
  @ApiPropertyOptional({
    example: '2024-01-20T14:00:00Z',
    description: 'Rescheduled date and time'
  })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiPropertyOptional({
    example: 'is_completed',
    description: 'Interview status ID'
  })
  @IsOptional()
  @IsString()
  statusId?: string;

  @ApiPropertyOptional({
    example: 'Candidate demonstrated strong technical knowledge',
    description: 'Interview notes'
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    example: 'Good communication skills, technical depth',
    description: 'Interview feedback'
  })
  @IsOptional()
  @IsString()
  feedback?: string;

  @ApiPropertyOptional({
    example: 8,
    description: 'Rating out of 10',
    minimum: 1,
    maximum: 10
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  @Type(() => Number)
  rating?: number;

  @ApiPropertyOptional({
    example: 'hire',
    description: 'Interview recommendation',
    enum: ['hire', 'reject', 'maybe']
  })
  @IsOptional()
  @IsString()
  recommendation?: string;
}

export class InterviewResponseDto {
  @ApiProperty({ example: 'int_123' })
  id: string;

  @ApiProperty({ example: 'app_123' })
  applicationId: string;

  @ApiProperty({ example: 'job_123' })
  jobId: string;

  @ApiPropertyOptional({ example: 'it_video' })
  typeId?: string;

  @ApiProperty({ example: '2024-01-20T14:00:00Z' })
  scheduledAt: Date;

  @ApiPropertyOptional({ example: 60 })
  duration?: number;

  @ApiPropertyOptional({ example: 'https://meet.google.com/abc-defg-hij' })
  location?: string;

  @ApiProperty({ example: 'emp_123' })
  conductorId: string;

  @ApiPropertyOptional({ example: 'is_scheduled' })
  statusId?: string;

  @ApiPropertyOptional({ example: 'Strong technical skills' })
  notes?: string;

  @ApiPropertyOptional({ example: 'Good candidate for the role' })
  feedback?: string;

  @ApiPropertyOptional({ example: 8 })
  rating?: number;

  @ApiPropertyOptional({ example: 'hire' })
  recommendation?: string;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  updatedAt: Date;
}