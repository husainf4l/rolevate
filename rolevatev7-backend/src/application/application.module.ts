import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationService } from './application.service';
import { ApplicationResolver } from './application.resolver';
import { Application } from './application.entity';
import { ApplicationNote } from './application-note.entity';
import { User } from '../user/user.entity';
import { CandidateProfile } from '../candidate/candidate-profile.entity';
import { AuditService } from '../audit.service';
import { AuthModule } from '../auth/auth.module';
import { LiveKitModule } from '../livekit/livekit.module';
import { CommunicationModule } from '../communication/communication.module';
import { NotificationModule } from '../notification/notification.module';
import { ServicesModule } from '../services/services.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Application, ApplicationNote, User, CandidateProfile]),
    AuthModule,
    LiveKitModule,
    CommunicationModule,
    NotificationModule,
    ServicesModule,
  ],
  providers: [ApplicationService, ApplicationResolver, AuditService],
  exports: [ApplicationService],
})
export class ApplicationModule {}