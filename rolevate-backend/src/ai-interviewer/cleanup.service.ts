import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TextToSpeechService } from './text-to-speech.service';
import { InterviewService } from './interview.service';
import { AiBotService } from './ai-bot.service';
import { Interval } from '@nestjs/schedule';

@Injectable()
export class CleanupService implements OnModuleInit {
  private readonly logger = new Logger(CleanupService.name);
  private readonly audioFileMaxAge: number; // in milliseconds
  private readonly interviewSessionMaxAge: number; // in milliseconds

  constructor(
    private readonly configService: ConfigService,
    private readonly textToSpeechService: TextToSpeechService,
    private readonly interviewService: InterviewService,
    private readonly aiBotService: AiBotService,
  ) {
    // Default to 1 hour for audio files
    this.audioFileMaxAge = 
      parseInt(this.configService.get<string>('AUDIO_FILE_MAX_AGE', '3600')) * 1000;
    
    // Default to 24 hours for interview sessions
    this.interviewSessionMaxAge = 
      parseInt(this.configService.get<string>('INTERVIEW_SESSION_MAX_AGE', '86400')) * 1000;
  }

  onModuleInit() {
    this.logger.log(
      `Cleanup service initialized with audio file max age: ${this.audioFileMaxAge / 1000}s, ` +
      `interview session max age: ${this.interviewSessionMaxAge / 1000}s`
    );
  }

  /**
   * Run cleanup tasks every hour
   */
  @Interval(3600000) // 1 hour
  async runCleanupTasks() {
    this.logger.log('Running scheduled cleanup tasks');
    
    try {
      // Clean up old audio files
      this.textToSpeechService.cleanupOldAudioFiles(this.audioFileMaxAge);
      
      // Clean up old interview sessions
      await this.cleanupInactiveSessions();
      
      this.logger.log('Scheduled cleanup tasks completed');
    } catch (error) {
      this.logger.error(`Error during cleanup: ${error.message}`, error.stack);
    }
  }

  /**
   * Clean up inactive interview sessions
   */
  private async cleanupInactiveSessions() {
    // This would require implementing a method to list all interviews
    // and check which ones are inactive based on last activity timestamp
    // 
    // The implementation would look something like:
    //
    // const now = Date.now();
    // const interviews = this.interviewService.listInterviews();
    // 
    // for (const interview of interviews) {
    //   // Check if the interview is completed or inactive for too long
    //   if (interview.state === 'completed' || 
    //       (now - interview.lastActivityTime > this.interviewSessionMaxAge)) {
    //     
    //     // Disconnect the AI bot if it's still connected
    //     this.aiBotService.disconnectAiBot(interview.roomName);
    //   }
    // }
    
    this.logger.log('Interview session cleanup is not yet implemented');
  }
}
