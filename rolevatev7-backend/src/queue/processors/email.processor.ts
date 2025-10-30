import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { EmailJobData } from '../queue.service';

/**
 * Email Job Processor
 * Handles email sending jobs from the queue
 */
@Processor('email')
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  async process(job: Job<EmailJobData>): Promise<any> {
    const { to, subject } = job.data;

    this.logger.log(`Processing email job ${job.id} to ${to}`);

    try {
      // TODO: Implement actual email sending logic
      // For now, just log the attempt
      this.logger.log(`Email would be sent to: ${to}`);
      this.logger.log(`Subject: ${subject}`);
      
      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        success: true,
        messageId: `email-${Date.now()}`,
        to,
        subject,
      };
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error instanceof Error ? error.message : String(error)}`);
      throw error; // Will trigger retry
    }
  }
}
