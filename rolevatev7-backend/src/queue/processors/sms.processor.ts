import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { SmsJobData } from '../queue.service';

/**
 * SMS Job Processor
 * Handles SMS sending jobs from the queue
 */
@Processor('sms')
export class SmsProcessor extends WorkerHost {
  private readonly logger = new Logger(SmsProcessor.name);

  async process(job: Job<SmsJobData>): Promise<any> {
    const { phoneNumber, message, messageType } = job.data;

    this.logger.log(`Processing SMS job ${job.id} to ${phoneNumber}`);

    try {
      // TODO: Implement actual SMS sending logic via JOSMSService
      // For now, just log the attempt
      this.logger.log(`SMS would be sent to: ${phoneNumber}`);
      this.logger.log(`Message: ${message.substring(0, 50)}...`);
      this.logger.log(`Type: ${messageType || 'GENERAL'}`);
      
      // Simulate SMS sending delay
      await new Promise(resolve => setTimeout(resolve, 500));

      return {
        success: true,
        messageId: `sms-${Date.now()}`,
        phoneNumber,
        messageType,
      };
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${phoneNumber}: ${error instanceof Error ? error.message : String(error)}`);
      throw error; // Will trigger retry
    }
  }
}
