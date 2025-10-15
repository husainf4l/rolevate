import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AwsS3Service } from './aws-s3.service';
import { AwsS3Resolver } from './aws-s3.resolver';
import { CvParsingService } from './cv-parsing.service';
import { CvAnalysisResolver } from './cv-analysis.resolver';
import { OpenaiCvAnalysisService } from './openai-cv-analysis.service';
import { FileValidationService } from './file-validation.service';
import { CVErrorHandlingService } from './cv-error-handling.service';
import { AiautocompleteService } from './aiautocomplete.service';
import { AiautocompleteResolver } from './aiautocomplete.resolver';
import { EmailService } from './email.service';
import { Job } from '../job/job.entity';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Job])],
  providers: [
    AwsS3Service,
    AwsS3Resolver,
    CvParsingService,
    CvAnalysisResolver,
    OpenaiCvAnalysisService,
    FileValidationService,
    CVErrorHandlingService,
    AiautocompleteService,
    AiautocompleteResolver,
    EmailService,
  ],
  exports: [
    AwsS3Service,
    CvParsingService,
    OpenaiCvAnalysisService,
    FileValidationService,
    CVErrorHandlingService,
    AiautocompleteService,
    EmailService,
  ],
})
export class ServicesModule {}
