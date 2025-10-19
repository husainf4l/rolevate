import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AwsS3Service } from './aws-s3.service';
import { AwsS3Resolver } from './aws-s3.resolver';
import { FileValidationService } from './file-validation.service';
import { CVErrorHandlingService } from './cv-error-handling.service';
import { AiautocompleteService } from './aiautocomplete.service';
import { AiautocompleteResolver } from './aiautocomplete.resolver';
import { EmailService } from './email.service';
import { JOSMSService } from './josms.service';
import { SMSService } from './sms.service';
import { SMSResolver } from './sms.resolver';
import { Job } from '../job/job.entity';
import { Communication } from '../communication/communication.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    ConfigModule, 
    TypeOrmModule.forFeature([Job, Communication]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'defaultSecret',
        signOptions: { expiresIn: '60m' },
      }),
      inject: [ConfigService],
    }),
    UserModule,
  ],
  providers: [
    AwsS3Service,
    AwsS3Resolver,
    FileValidationService,
    CVErrorHandlingService,
    AiautocompleteService,
    AiautocompleteResolver,
    EmailService,
    JOSMSService,
    SMSService,
    SMSResolver,
  ],
  exports: [
    AwsS3Service,
    FileValidationService,
    CVErrorHandlingService,
    AiautocompleteService,
    EmailService,
    JOSMSService,
    SMSService,
  ],
})
export class ServicesModule {}
