import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InterviewService } from './interview.service';
import { InterviewResolver } from './interview.resolver';
import { TranscriptService } from './transcript.service';
import { TranscriptResolver } from './transcript.resolver';
import { Interview } from './interview.entity';
import { Transcript } from './transcript.entity';
import { Application } from '../application/application.entity';
import { User } from '../user/user.entity';
import { WhatsAppModule } from '../whatsapp/whatsapp.module';
import { LiveKitModule } from '../livekit/livekit.module';
import { InterviewerCreatorService } from './services/interviewer-creator.service';
import { InterviewNotificationService } from './services/interview-notification.service';
import { InterviewRoomService } from './services/interview-room.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Interview, Transcript, Application, User]), 
    WhatsAppModule, 
    LiveKitModule
  ],
  providers: [
    InterviewService,
    InterviewResolver,
    TranscriptService,
    TranscriptResolver,
    InterviewerCreatorService,
    InterviewNotificationService,
    InterviewRoomService,
  ],
  exports: [InterviewService, TranscriptService],
})
export class InterviewModule {}