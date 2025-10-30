import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export interface EmailJobData {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export interface SmsJobData {
  phoneNumber: string;
  message: string;
  senderId?: string;
  messageType?: 'OTP' | 'GENERAL';
}

export interface WhatsAppJobData {
  phoneNumber: string;
  message: string;
  templateName?: string;
  templateParams?: Record<string, any>;
}

export interface CvAnalysisJobData {
  candidateId: string;
  cvUrl: string;
  jobId?: string;
  analysisType: 'full' | 'quick' | 'skills-only';
}

/**
 * Queue Service
 * Central service for adding jobs to various queues
 */
@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @InjectQueue('email') private emailQueue: Queue,
    @InjectQueue('sms') private smsQueue: Queue,
    @InjectQueue('whatsapp') private whatsappQueue: Queue,
    @InjectQueue('cv-analysis') private cvAnalysisQueue: Queue,
  ) {}

  /**
   * Add email job to queue
   */
  async sendEmail(data: EmailJobData, priority: number = 0): Promise<void> {
    try {
      await this.emailQueue.add('send-email', data, { priority });
      this.logger.log(`Email job added to queue: ${data.to}`);
    } catch (error) {
      this.logger.error(`Failed to add email job to queue: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Add SMS job to queue
   */
  async sendSms(data: SmsJobData, priority: number = 0): Promise<void> {
    try {
      await this.smsQueue.add('send-sms', data, { priority });
      this.logger.log(`SMS job added to queue: ${data.phoneNumber}`);
    } catch (error) {
      this.logger.error(`Failed to add SMS job to queue: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Add WhatsApp job to queue
   */
  async sendWhatsApp(data: WhatsAppJobData, priority: number = 0): Promise<void> {
    try {
      await this.whatsappQueue.add('send-whatsapp', data, { priority });
      this.logger.log(`WhatsApp job added to queue: ${data.phoneNumber}`);
    } catch (error) {
      this.logger.error(`Failed to add WhatsApp job to queue: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Add CV analysis job to queue
   */
  async analyzeCv(data: CvAnalysisJobData, priority: number = 0): Promise<void> {
    try {
      await this.cvAnalysisQueue.add('analyze-cv', data, {
        priority,
        attempts: 2, // CV analysis is expensive, limit retries
      });
      this.logger.log(`CV analysis job added to queue: ${data.candidateId}`);
    } catch (error) {
      this.logger.error(`Failed to add CV analysis job to queue: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(queueName: 'email' | 'sms' | 'whatsapp' | 'cv-analysis') {
    const queue = this.getQueue(queueName);
    
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ]);

    return {
      queueName,
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + completed + failed + delayed,
    };
  }

  /**
   * Get all queue statistics
   */
  async getAllQueueStats() {
    const queues: Array<'email' | 'sms' | 'whatsapp' | 'cv-analysis'> = ['email', 'sms', 'whatsapp', 'cv-analysis'];
    const stats = await Promise.all(queues.map(q => this.getQueueStats(q)));
    return stats;
  }

  /**
   * Pause a queue
   */
  async pauseQueue(queueName: 'email' | 'sms' | 'whatsapp' | 'cv-analysis') {
    const queue = this.getQueue(queueName);
    await queue.pause();
    this.logger.warn(`Queue paused: ${queueName}`);
  }

  /**
   * Resume a queue
   */
  async resumeQueue(queueName: 'email' | 'sms' | 'whatsapp' | 'cv-analysis') {
    const queue = this.getQueue(queueName);
    await queue.resume();
    this.logger.log(`Queue resumed: ${queueName}`);
  }

  /**
   * Clean completed jobs from a queue
   */
  async cleanQueue(queueName: 'email' | 'sms' | 'whatsapp' | 'cv-analysis', gracePeriod: number = 86400000) {
    const queue = this.getQueue(queueName);
    await queue.clean(gracePeriod, 100, 'completed');
    await queue.clean(gracePeriod * 7, 1000, 'failed'); // Keep failed jobs longer
    this.logger.log(`Queue cleaned: ${queueName}`);
  }

  private getQueue(queueName: 'email' | 'sms' | 'whatsapp' | 'cv-analysis'): Queue {
    switch (queueName) {
      case 'email':
        return this.emailQueue;
      case 'sms':
        return this.smsQueue;
      case 'whatsapp':
        return this.whatsappQueue;
      case 'cv-analysis':
        return this.cvAnalysisQueue;
    }
  }
}
