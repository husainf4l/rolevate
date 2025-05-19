import { IsString, IsNotEmpty } from 'class-validator';

export class CreateInterviewDto {
  @IsString()
  @IsNotEmpty({ message: 'Room name is required' })
  roomName: string;

  @IsString()
  @IsNotEmpty({ message: 'Candidate ID is required' })
  candidateId: string;

  @IsString()
  @IsNotEmpty({ message: 'Job description is required' })
  jobDescription: string;
}

export class ResponseDto {
  @IsString()
  @IsNotEmpty({ message: 'Response text is required' })
  response: string;
}
