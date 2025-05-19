import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AiService } from './ai.service';
import { InterviewService } from './interview.service';
import { InterviewController } from './interview.controller';
import { InterviewGateway } from './interview.gateway';
import { AiBotService } from './ai-bot.service';
import { TranscriptionController } from './transcription.controller';
import { TextToSpeechService } from './text-to-speech.service';
import { AudioController } from './audio.controller';
import { CleanupService } from './cleanup.service';
import { LivekitModule } from '../livekit/livekit.module';

@Module({
  imports: [
    LivekitModule,
    ScheduleModule.forRoot(),
  ],
  providers: [
    AiService,
    InterviewService,
    InterviewGateway,
    AiBotService,
    TextToSpeechService,
    CleanupService,
  ],
  controllers: [InterviewController, TranscriptionController, AudioController],
  exports: [AiService, InterviewService, AiBotService, TextToSpeechService],
})
export class AiInterviewerModule {}
