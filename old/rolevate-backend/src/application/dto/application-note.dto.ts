import { IsString, IsEnum, IsOptional } from 'class-validator';
import { NoteSource } from '@prisma/client';

export class CreateApplicationNoteDto {
  @IsString()
  text: string;

  @IsEnum(NoteSource)
  source: NoteSource;

  @IsOptional()
  @IsString()
  userId?: string; // Optional, for system/AI notes
}

export class UpdateApplicationNoteDto {
  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsEnum(NoteSource)
  source?: NoteSource;
}

export class ApplicationNoteResponseDto {
  id: string;
  applicationId: string;
  text: string;
  createdAt: Date;
  source: NoteSource;
  userId?: string;
  user?: {
    id: string;
    name?: string;
    email?: string;
  };
}
