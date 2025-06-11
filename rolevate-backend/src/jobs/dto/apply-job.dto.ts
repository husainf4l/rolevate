import { IsString, IsNotEmpty, IsPhoneNumber, IsUUID, IsOptional } from 'class-validator';

export class ApplyToJobDto {
  @IsUUID()
  @IsNotEmpty()
  jobId: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsPhoneNumber('JO') // Jordan phone number format
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsOptional()
  coverLetter?: string; // Optional cover letter
}

// For file upload validation
export interface CVFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}
