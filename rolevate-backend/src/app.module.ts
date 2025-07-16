import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { CompanyModule } from './company/company.module';
import { AiautocompleteModule } from './aiautocomplete/aiautocomplete.module';
import { JobModule } from './job/job.module';
import { CandidateModule } from './candidate/candidate.module';
import { AppCacheModule } from './cache/cache.module';
import { UploadsModule } from './uploads/uploads.module';
import { LiveKitModule } from './livekit/livekit.module';
import { ApplicationModule } from './application/application.module';
import { SecurityModule } from './security/security.module';
import { NotificationModule } from './notification/notification.module';
import { CommunicationModule } from './communication/communication.module';

@Module({
  // Removed duplicate imports property
  imports: [
    PrismaModule,
    AuthModule,
    UserModule,
    CompanyModule,
    AiautocompleteModule,
    JobModule,
    CandidateModule,
    AppCacheModule,
    UploadsModule,
    LiveKitModule,
    ApplicationModule,
    SecurityModule,
    NotificationModule,
    CommunicationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
