import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InterviewService } from './interview.service';
import { InterviewResolver } from './interview.resolver';
import { TranscriptService } from './transcript.service';
import { TranscriptResolver } from './transcript.resolver';
import { Interview } from './interview.entity';
import { Transcript } from './transcript.entity';
import { WhatsAppModule } from '../whatsapp/whatsapp.module';

@Module({
  imports: [TypeOrmModule.forFeature([Interview, Transcript]), WhatsAppModule],
  providers: [InterviewService, InterviewResolver, TranscriptService, TranscriptResolver],
  exports: [InterviewService, TranscriptService],
})
export class InterviewModule {}