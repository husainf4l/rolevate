import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsPhoneNumber, MinLength, MaxLength } from 'class-validator';
import { InterviewType } from '@prisma/client';

export class JoinInterviewDto {
  @IsPhoneNumber('JO', { message: 'Please provide a valid phone number' }) // Jordan format for +962
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;
}

export class CreateInterviewRoomDto {
  @IsString()
  @IsNotEmpty()
  jobPostId: string; // Changed from applicationId to jobPostId

  @IsEnum(InterviewType)
  interviewType: InterviewType;

  @IsOptional()
  @IsNumber()
  maxDuration?: number; // in seconds

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  @IsString()
  customRoomCode?: string; // Allow custom room codes

  @IsOptional()
  @IsNumber()
  maxCandidates?: number; // Maximum number of candidates for this job
}
