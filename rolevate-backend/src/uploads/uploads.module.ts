import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { AwsS3Service } from '../services/aws-s3.service';
import { CvParsingService } from '../services/cv-parsing.service';

@Module({
  controllers: [UploadsController],
  providers: [AwsS3Service, CvParsingService],
  exports: [AwsS3Service, CvParsingService],
})
export class UploadsModule {}
