import { IsString, IsOptional, IsNumber, IsNotEmpty } from 'class-validator';

export class RoomDto {
  @IsString()
  @IsNotEmpty({ message: 'Room name is required' })
  name: string;

  @IsNumber()
  @IsOptional()
  emptyTimeout?: number;

  @IsNumber()
  @IsOptional()
  maxParticipants?: number;

  @IsString()
  @IsOptional()
  metadata?: string;
}
