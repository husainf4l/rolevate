import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JOSMSService, JOSMSMessageType } from './josms.service';
import { Communication, CommunicationType, CommunicationDirection, CommunicationStatus } from '../communication/communication.entity';
import { SendSMSInput, SendBulkSMSInput, SendOTPSMSInput, SMSMessageType } from './sms.input';
import { SMSResponse, SMSBalanceResponse, BulkSMSResponse, SMSStatus, SMSCostEstimation } from './sms.dto';

/**
 * SMS Service
 * 
 * High-level service for sending SMS messages through JOSMS gateway
 * Automatically logs all SMS communications to the database
 */

@Injectable()
export class SMSService {
  private readonly logger = new Logger(SMSService.name);

  constructor(
    private readonly josmsService: JOSMSService,
    @InjectRepository(Communication)
    private communicationRepository: Repository<Communication>,
  ) {}

  /**
   * Send a single SMS message
   */
  async sendSMS(input: SendSMSInput): Promise<SMSResponse> {
    try {
      this.logger.log(`Sending SMS to ${input.phoneNumber}: ${input.message.substring(0, 50)}...`);

      // Determine message type
      let messageType: JOSMSMessageType;
      switch (input.type) {
        case 'OTP':
          messageType = JOSMSMessageType.OTP;
          break;
        case 'GENERAL':
        default:
          messageType = JOSMSMessageType.GENERAL;
          break;
      }

      // Send SMS via JOSMS
      const result = await this.josmsService.sendSMS(
        input.phoneNumber,
        input.message,
        {
          type: messageType,
          messageId: input.messageId,
          senderId: input.senderId,
        },
      );

      // Determine communication status
      const commStatus = result.success 
        ? CommunicationStatus.SENT 
        : CommunicationStatus.FAILED;

      // Log to database
      const communication = this.communicationRepository.create({
        candidateId: input.candidateId,
        companyId: input.companyId,
        jobId: input.jobId,
        applicationId: input.applicationId,
        type: CommunicationType.SMS,
        direction: CommunicationDirection.OUTBOUND,
        content: input.message,
        phoneNumber: input.phoneNumber,
        status: commStatus,
        sentAt: new Date(),
      });

      await this.communicationRepository.save(communication);

      this.logger.log(`SMS ${result.success ? 'sent successfully' : 'failed'} to ${input.phoneNumber}`);

      return {
        success: result.success,
        messageId: result.messageId,
        response: result.response,
        error: result.error,
        statusCode: result.statusCode,
        status: result.success ? SMSStatus.SENT : SMSStatus.FAILED,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to send SMS: ${errorMessage}`, errorStack);
      return {
        success: false,
        error: errorMessage,
        status: SMSStatus.FAILED,
      };
    }
  }

  /**
   * Send OTP SMS with pre-formatted message
   */
  async sendOTP(input: SendOTPSMSInput): Promise<SMSResponse> {
    try {
      // Default OTP message template
      const defaultTemplate = `Your verification code is: {code}. Valid for 10 minutes. Do not share this code with anyone.`;
      
      const messageTemplate = input.messageTemplate || defaultTemplate;
      const message = messageTemplate.replace('{code}', input.otpCode);

      return this.sendSMS({
        phoneNumber: input.phoneNumber,
        message,
        type: SMSMessageType.OTP,
        candidateId: input.candidateId,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to send OTP SMS: ${errorMessage}`, errorStack);
      return {
        success: false,
        error: errorMessage,
        status: SMSStatus.FAILED,
      };
    }
  }

  /**
   * Send bulk SMS messages
   */
  async sendBulkSMS(input: SendBulkSMSInput): Promise<BulkSMSResponse> {
    try {
      this.logger.log(`Sending bulk SMS to ${input.phoneNumbers.length} recipients`);

      // Validate recipient count
      if (input.phoneNumbers.length > 120) {
        throw new Error('Maximum 120 recipients allowed per bulk SMS request');
      }

      // Calculate cost estimation
      const costEstimation = this.josmsService.calculateCost(
        input.message,
        input.phoneNumbers.length,
      );

      // Send bulk SMS via JOSMS
      const result = await this.josmsService.sendBulkMessages({
        numbers: input.phoneNumbers,
        message: input.message,
        senderId: input.senderId,
        messageId: input.messageId,
      });

      // Determine communication status
      const commStatus = result.success 
        ? CommunicationStatus.SENT 
        : CommunicationStatus.FAILED;

      // Log to database (one record for bulk)
      const communication = this.communicationRepository.create({
        companyId: input.companyId,
        jobId: input.jobId,
        type: CommunicationType.SMS,
        direction: CommunicationDirection.OUTBOUND,
        content: `BULK SMS to ${input.phoneNumbers.length} recipients: ${input.message}`,
        phoneNumber: input.phoneNumbers.join(','),
        status: commStatus,
        sentAt: new Date(),
      });

      await this.communicationRepository.save(communication);

      this.logger.log(`Bulk SMS ${result.success ? 'sent successfully' : 'failed'} to ${input.phoneNumbers.length} recipients`);

      return {
        success: result.success,
        totalRecipients: input.phoneNumbers.length,
        messageId: result.messageId,
        response: result.response,
        error: result.error,
        costEstimation: {
          parts: costEstimation.parts,
          totalMessages: costEstimation.totalMessages,
          estimatedCost: costEstimation.estimatedCost,
          currency: 'JOD',
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to send bulk SMS: ${errorMessage}`, errorStack);
      return {
        success: false,
        totalRecipients: input.phoneNumbers.length,
        error: errorMessage,
      };
    }
  }

  /**
   * Get SMS account balance
   */
  async getBalance(): Promise<SMSBalanceResponse> {
    try {
      return await this.josmsService.getBalance();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to get SMS balance: ${errorMessage}`, errorStack);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Calculate SMS cost estimation
   */
  async estimateCost(message: string, recipientCount: number = 1): Promise<SMSCostEstimation> {
    const estimation = this.josmsService.calculateCost(message, recipientCount);
    return {
      parts: estimation.parts,
      totalMessages: estimation.totalMessages,
      estimatedCost: estimation.estimatedCost,
      currency: 'JOD',
    };
  }

  /**
   * Send application status update SMS
   */
  async sendApplicationStatusSMS(
    phoneNumber: string,
    candidateName: string,
    jobTitle: string,
    status: string,
    candidateId?: string,
    applicationId?: string,
  ): Promise<SMSResponse> {
    const messages: Record<string, string> = {
      REVIEWED: `Hi ${candidateName}, your application for ${jobTitle} is under review. We'll get back to you soon!`,
      SHORTLISTED: `Congratulations ${candidateName}! You've been shortlisted for ${jobTitle}. We'll contact you with next steps.`,
      INTERVIEWED: `Hi ${candidateName}, your interview for ${jobTitle} has been scheduled. Check your WhatsApp for details.`,
      OFFERED: `Congratulations ${candidateName}! You've received a job offer for ${jobTitle}. Check your email for details.`,
      HIRED: `Welcome aboard ${candidateName}! You've been hired for ${jobTitle}. We're excited to have you on the team!`,
      REJECTED: `Hi ${candidateName}, thank you for your interest in ${jobTitle}. Unfortunately, we won't be moving forward at this time.`,
    };

    const message = messages[status] || `Hi ${candidateName}, your application status for ${jobTitle} has been updated to ${status}.`;

    return this.sendSMS({
      phoneNumber,
      message,
      type: SMSMessageType.GENERAL,
      candidateId,
      applicationId,
    });
  }

  /**
   * Send interview reminder SMS
   */
  async sendInterviewReminderSMS(
    phoneNumber: string,
    candidateName: string,
    jobTitle: string,
    interviewDate: Date,
    candidateId?: string,
    applicationId?: string,
  ): Promise<SMSResponse> {
    const dateStr = interviewDate.toLocaleDateString('en-GB');
    const timeStr = interviewDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    
    const message = `Reminder: Hi ${candidateName}, your interview for ${jobTitle} is scheduled for ${dateStr} at ${timeStr}. Good luck!`;

    return this.sendSMS({
      phoneNumber,
      message,
      type: SMSMessageType.GENERAL,
      candidateId,
      applicationId,
    });
  }

  /**
   * Send job alert SMS to candidates
   */
  async sendJobAlertSMS(
    phoneNumbers: string[],
    jobTitle: string,
    companyName: string,
    jobUrl: string,
    companyId?: string,
    jobId?: string,
  ): Promise<BulkSMSResponse> {
    const message = `New Job Alert: ${jobTitle} at ${companyName}. Apply now: ${jobUrl}`;

    return this.sendBulkSMS({
      phoneNumbers,
      message,
      companyId,
      jobId,
    });
  }
}
