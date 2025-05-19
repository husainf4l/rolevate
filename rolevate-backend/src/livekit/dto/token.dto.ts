import { IsString, IsOptional, IsBoolean, IsNotEmpty } from 'class-validator';

export class TokenDto {
  @IsString()
  @IsNotEmpty({ message: 'Identity is required' })
  identity: string;

  @IsString()
  @IsNotEmpty({ message: 'Room name is required' })
  name: string;  // This is the room name in LiveKit's SDK

  @IsBoolean()
  @IsOptional()
  canPublish?: boolean;

  @IsBoolean()
  @IsOptional()
  canSubscribe?: boolean;

  @IsBoolean()
  @IsOptional()
  canPublishData?: boolean;
}
