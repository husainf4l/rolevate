import { IsString, IsOptional, IsNotEmpty, IsIn } from 'class-validator';

export class SynthesizeSpeechDto {
  @IsString()
  @IsNotEmpty({ message: 'Text is required for speech synthesis' })
  text: string;

  @IsString()
  @IsOptional()
  @IsIn(['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'], {
    message: 'Voice must be one of: alloy, echo, fable, onyx, nova, shimmer',
  })
  voice?: string;
}
