import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { WhatsAppJobData } from '../queue.service';

/**
 * WhatsApp Job Processor
 * Handles WhatsApp message sending jobs from the queue
 */
@Processor('whatsapp')
export class WhatsAppProcessor extends WorkerHost {
  private readonly logger = new Logger(WhatsAppProcessor.name);

  async process(job: Job<WhatsAppJobData>): Promise<any> {
    const { phoneNumber, message, templateName } = job.data;

    this.logger.log(`Processing WhatsApp job ${job.id} to ${phoneNumber}`);

    try {
      // TODO: Implement actual WhatsApp sending logic
      // For now, just log the attempt
      this.logger.log(`WhatsApp would be sent to: ${phoneNumber}`);
      this.logger.log(`Message: ${message.substring(0, 50)}...`);
      if (templateName) {
        this.logger.log(`Template: ${templateName}`);
      }
      
      // Simulate WhatsApp sending delay
      await new Promise(resolve => setTimeout(resolve, 800));

      return {
        success: true,
        messageId: `whatsapp-${Date.now()}`,
        phoneNumber,
        templateName,
      };
    } catch (error) {
      this.logger.error(`Failed to send WhatsApp to ${phoneNumber}: ${error instanceof Error ? error.message : String(error)}`);
      throw error; // Will trigger retry
    }
  }
}
