import { IsString, IsNotEmpty } from 'class-validator';

export class RequirementsPolishRequestDto {
  @IsString()
  @IsNotEmpty()
  requirements: string;
}

export class RequirementsPolishResponseDto {
  polishedRequirements: string;
}
