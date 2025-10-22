import { IsString, IsOptional, IsEnum, IsDateString, IsNumber, IsArray, IsObject, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { InterviewStatus, InterviewType, SpeakerType } from '@prisma/client';

export class CreateInterviewDto {
  @IsString()
  jobId: string;

  @IsString()
  candidateId: string;

  @IsString()
  companyId: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(InterviewType)
  type?: InterviewType;

  @IsOptional()
  @IsEnum(InterviewStatus)
  status?: InterviewStatus;

  @IsDateString()
  scheduledAt: string;

  @IsOptional()
  @IsDateString()
  startedAt?: string;

  @IsOptional()
  @IsDateString()
  endedAt?: string;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsString()
  roomId?: string;

  @IsOptional()
  @IsString()
  videoLink?: string;

  @IsOptional()
  @IsString()
  recordingUrl?: string;

  @IsOptional()
  @IsString()
  interviewerNotes?: string;

  @IsOptional()
  @IsString()
  candidateFeedback?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  overallRating?: number;

  @IsOptional()
  @IsObject()
  technicalQuestions?: any;

  @IsOptional()
  @IsObject()
  technicalAnswers?: any;

  @IsOptional()
  @IsObject()
  metadata?: any;
}

export class UpdateInterviewDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(InterviewType)
  type?: InterviewType;

  @IsOptional()
  @IsEnum(InterviewStatus)
  status?: InterviewStatus;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsDateString()
  startedAt?: string;

  @IsOptional()
  @IsDateString()
  endedAt?: string;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsString()
  roomId?: string;

  @IsOptional()
  @IsString()
  videoLink?: string;

  @IsOptional()
  @IsString()
  recordingUrl?: string;

  @IsOptional()
  @IsString()
  interviewerNotes?: string;

  @IsOptional()
  @IsString()
  candidateFeedback?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  overallRating?: number;

  @IsOptional()
  @IsObject()
  technicalQuestions?: any;

  @IsOptional()
  @IsObject()
  technicalAnswers?: any;

  @IsOptional()
  @IsObject()
  aiAnalysis?: any;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  aiScore?: number;

  @IsOptional()
  @IsString()
  aiRecommendation?: string;

  @IsOptional()
  @IsObject()
  metadata?: any;
}

export class CreateTranscriptDto {
  @IsString()
  interviewId: string;

  @IsEnum(SpeakerType)
  speakerType: SpeakerType;

  @IsOptional()
  @IsString()
  speakerName?: string;

  @IsOptional()
  @IsString()
  speakerId?: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  confidence?: number;

  @IsOptional()
  @IsString()
  language?: string;

  @IsNumber()
  @Min(0)
  startTime: number;

  @IsNumber()
  @Min(0)
  endTime: number;

  @IsNumber()
  @Min(0)
  duration: number;

  @IsOptional()
  @IsString()
  sentiment?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @IsOptional()
  @IsString()
  aiSummary?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  importance?: number;

  @IsNumber()
  @Min(1)
  sequenceNumber: number;

  @IsOptional()
  @IsObject()
  metadata?: any;
}

export class BulkCreateTranscriptDto {
  @IsString()
  interviewId: string;

  @IsArray()
  @Type(() => CreateTranscriptDto)
  transcripts: Omit<CreateTranscriptDto, 'interviewId'>[];
}

export class InterviewResponseDto {
  id: string;
  jobId: string;
  candidateId: string;
  companyId: string;
  title: string;
  description?: string;
  type: InterviewType;
  status: InterviewStatus;
  scheduledAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  duration?: number;
  roomId?: string;
  videoLink?: string;
  recordingUrl?: string;
  aiAnalysis?: any;
  aiScore?: number;
  aiRecommendation?: string;
  analyzedAt?: Date;
  interviewerNotes?: string;
  candidateFeedback?: string;
  overallRating?: number;
  technicalQuestions?: any;
  technicalAnswers?: any;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
  
  // Related data
  job?: {
    id: string;
    title: string;
  };
  candidate?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  company?: {
    id: string;
    name: string;
  };
  transcripts?: TranscriptResponseDto[];
}

export class TranscriptResponseDto {
  id: string;
  interviewId: string;
  speakerType: SpeakerType;
  speakerName?: string;
  speakerId?: string;
  content: string;
  confidence?: number;
  language?: string;
  startTime: number;
  endTime: number;
  duration: number;
  sentiment?: string;
  keywords?: string[];
  aiSummary?: string;
  importance?: number;
  sequenceNumber: number;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export class InterviewListResponseDto {
  interviews: InterviewResponseDto[];
  totalCount: number;
  page: number;
  limit: number;
}
