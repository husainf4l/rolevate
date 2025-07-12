import { IsString, IsEnum, IsOptional, IsBoolean, IsUrl, IsObject } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export enum NotificationType {
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  INFO = 'INFO',
  ERROR = 'ERROR'
}

export enum NotificationCategory {
  APPLICATION = 'APPLICATION',
  INTERVIEW = 'INTERVIEW',
  SYSTEM = 'SYSTEM',
  CANDIDATE = 'CANDIDATE',
  OFFER = 'OFFER'
}

export class CreateNotificationDto {
  @IsEnum(NotificationType)
  type: NotificationType;

  @IsEnum(NotificationCategory)
  category: NotificationCategory;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsUrl()
  @IsOptional()
  actionUrl?: string;

  @IsObject()
  @IsOptional()
  metadata?: {
    candidateName?: string;
    jobTitle?: string;
    interviewDate?: string;
    applicationId?: string;
    [key: string]: any;
  };

  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  companyId?: string;
}

export class UpdateNotificationDto extends PartialType(CreateNotificationDto) {
  @IsBoolean()
  @IsOptional()
  read?: boolean;
}

export class NotificationResponseDto {
  id: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  metadata?: {
    candidateName?: string;
    jobTitle?: string;
    interviewDate?: string;
    applicationId?: string;
    [key: string]: any;
  };
  userId?: string;
  companyId?: string;
  createdAt: string;
  updatedAt: string;
}

export class NotificationQueryDto {
  @IsEnum(NotificationType)
  @IsOptional()
  type?: NotificationType;

  @IsEnum(NotificationCategory)
  @IsOptional()
  category?: NotificationCategory;

  @IsBoolean()
  @IsOptional()
  read?: boolean;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  companyId?: string;
}