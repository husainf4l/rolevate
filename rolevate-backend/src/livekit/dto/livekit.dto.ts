import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class GenerateTokenDto {
  @IsOptional()
  @IsString()
  identity?: string;

  @IsString()
  roomName: string;

  @IsOptional()
  @IsString()
  name?: string;
}

export class CreateRoomDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  emptyTimeout?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(500)
  maxParticipants?: number;
}
