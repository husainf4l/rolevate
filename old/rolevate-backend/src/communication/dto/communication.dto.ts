import { IsString, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { CommunicationType, CommunicationDirection, CommunicationStatus } from '@prisma/client';

export class CreateCommunicationRequestDto {
  @IsString()
  candidateId: string;

  @IsOptional()
  @IsString()
  jobId?: string;

  @IsEnum(CommunicationType)
  type: CommunicationType;

  @IsEnum(CommunicationDirection)
  direction: CommunicationDirection;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  whatsappId?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;
}

export class CreateCommunicationDto {
  @IsString()
  candidateId: string;

  @IsString()
  companyId: string;

  @IsOptional()
  @IsString()
  jobId?: string;

  @IsEnum(CommunicationType)
  type: CommunicationType;

  @IsEnum(CommunicationDirection)
  direction: CommunicationDirection;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  whatsappId?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  templateName?: string;

  @IsOptional()
  templateParams?: string[];
}

export class SendWhatsAppDto {
  @IsString()
  candidateId: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  jobId?: string;

  @IsOptional()
  @IsString()
  templateName?: string;

  @IsOptional()
  templateParams?: string[];
}

export class CommunicationFiltersDto {
  @IsOptional()
  @IsString()
  candidateId?: string;

  @IsOptional()
  @IsString()
  jobId?: string;

  @IsOptional()
  @IsEnum(CommunicationType)
  type?: CommunicationType;

  @IsOptional()
  @IsEnum(CommunicationStatus)
  status?: CommunicationStatus;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @IsOptional()
  page?: number = 1;

  @IsOptional()
  limit?: number = 20;
}

export class CommunicationResponseDto {
  id: string;
  candidateId: string;
  companyId: string;
  jobId?: string;
  type: CommunicationType;
  direction: CommunicationDirection;
  status: CommunicationStatus;
  content: string;
  subject?: string;
  whatsappId?: string;
  phoneNumber?: string;
  sentAt: Date;
  deliveredAt?: Date;
  readAt?: Date;
  failedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  candidate?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  
  job?: {
    id: string;
    title: string;
  };
}
