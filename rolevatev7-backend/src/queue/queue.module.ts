import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailProcessor } from './processors/email.processor';
import { SmsProcessor } from './processors/sms.processor';
import { WhatsAppProcessor } from './processors/whatsapp.processor';
import { CvAnalysisProcessor } from './processors/cv-analysis.processor';
import { QueueService } from './queue.service';

/**
 * Queue Module
 * Manages background job processing with BullMQ and Redis
 * 
 * Queues:
 * - email: Email sending jobs
 * - sms: SMS sending jobs
 * - whatsapp: WhatsApp message jobs
 * - cv-analysis: CV analysis jobs
 */
@Module({
  imports: [
    ConfigModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          password: configService.get<string>('REDIS_PASSWORD'),
          db: configService.get<number>('REDIS_DB', 0),
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: {
            count: 100, // Keep last 100 completed jobs
            age: 86400, // 24 hours
          },
          removeOnFail: {
            count: 1000, // Keep last 1000 failed jobs for debugging
          },
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      { name: 'email' },
      { name: 'sms' },
      { name: 'whatsapp' },
      { name: 'cv-analysis' },
    ),
  ],
  providers: [
    QueueService,
    EmailProcessor,
    SmsProcessor,
    WhatsAppProcessor,
    CvAnalysisProcessor,
  ],
  exports: [QueueService],
})
export class QueueModule {}
