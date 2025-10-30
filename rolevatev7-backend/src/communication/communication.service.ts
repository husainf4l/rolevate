import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Communication, CommunicationType, CommunicationDirection, CommunicationStatus } from './communication.entity';
import { CreateCommunicationInput } from './create-communication.input';
import { UpdateCommunicationInput } from './update-communication.input';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { EmailService } from '../services/email.service';
import { JOSMSService } from '../services/josms.service';
import { JOSMSMessageType } from '../services/josms.service';

@Injectable()
export class CommunicationService {
  constructor(
    @InjectRepository(Communication)
    private communicationRepository: Repository<Communication>,
    private readonly whatsappService: WhatsAppService,
    private readonly emailService: EmailService,
    private readonly josmsService: JOSMSService,
  ) {}

  async create(createCommunicationInput: CreateCommunicationInput): Promise<Communication> {
    let whatsappId: string | undefined;
    let communicationStatus: CommunicationStatus = CommunicationStatus.SENT;

    // If it's a WhatsApp message and direction is OUTBOUND, actually send it
    if (createCommunicationInput.type === CommunicationType.WHATSAPP && createCommunicationInput.direction === CommunicationDirection.OUTBOUND) {
      try {
        if (!createCommunicationInput.phoneNumber) {
          throw new Error('Phone number is required for WhatsApp messages');
        }

        console.log(`Sending WhatsApp message to ${createCommunicationInput.phoneNumber}: ${createCommunicationInput.content}`);

        let whatsappResult;

        if (createCommunicationInput.templateName) {
          // Send template message with parameters
          console.log(`Using template: ${createCommunicationInput.templateName} with params:`, createCommunicationInput.templateParams);
          whatsappResult = await this.whatsappService.sendTemplateMessage(
            createCommunicationInput.phoneNumber,
            createCommunicationInput.templateName,
            undefined, // Auto-detect language
            createCommunicationInput.templateParams
          );
        } else {
          // Send regular text message
          whatsappResult = await this.whatsappService.sendTextMessage(
            createCommunicationInput.phoneNumber,
            createCommunicationInput.content
          );
        }

        whatsappId = whatsappResult.messages?.[0]?.id;
        console.log(`WhatsApp message sent successfully. Message ID: ${whatsappId}`);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Failed to send WhatsApp message:', errorMessage);
        communicationStatus = CommunicationStatus.FAILED;
        // Continue to create the record but mark as failed
      }
    }

    // If it's an email and direction is OUTBOUND, actually send it
    if (createCommunicationInput.type === CommunicationType.EMAIL && createCommunicationInput.direction === CommunicationDirection.OUTBOUND) {
      try {
        if (!createCommunicationInput.email) {
          throw new Error('Email address is required for email messages');
        }

        console.log(`Sending email to ${createCommunicationInput.email}: ${createCommunicationInput.content}`);

        if (createCommunicationInput.templateName) {
          // Send template email with parameters
          console.log(`Using template: ${createCommunicationInput.templateName} with params:`, createCommunicationInput.templateParams);
          await this.emailService.sendTemplateEmail(
            createCommunicationInput.email,
            createCommunicationInput.templateName,
            createCommunicationInput.templateParams || []
          );
        } else {
          // Send regular email
          await this.emailService.sendEmail(
            createCommunicationInput.email,
            'Notification', // Default subject
            createCommunicationInput.content
          );
        }

        console.log(`Email sent successfully to ${createCommunicationInput.email}`);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Failed to send email:', errorMessage);
        communicationStatus = CommunicationStatus.FAILED;
        // Continue to create the record but mark as failed
      }
    }

    // If it's an SMS and direction is OUTBOUND, actually send it
    if (createCommunicationInput.type === CommunicationType.SMS && createCommunicationInput.direction === CommunicationDirection.OUTBOUND) {
      try {
        if (!createCommunicationInput.phoneNumber) {
          throw new Error('Phone number is required for SMS messages');
        }

        console.log(`Sending SMS to ${createCommunicationInput.phoneNumber}: ${createCommunicationInput.content}`);

        // Determine message type based on content or template
        const messageType = createCommunicationInput.content.includes('OTP') || 
                           createCommunicationInput.content.includes('verification code')
          ? JOSMSMessageType.OTP
          : JOSMSMessageType.GENERAL;

        const smsResult = await this.josmsService.sendSMS(
          createCommunicationInput.phoneNumber,
          createCommunicationInput.content,
          {
            type: messageType,
          }
        );

        if (!smsResult.success) {
          throw new Error(smsResult.error || 'SMS sending failed');
        }

        console.log(`SMS sent successfully to ${createCommunicationInput.phoneNumber}. Message ID: ${smsResult.messageId}`);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Failed to send SMS:', errorMessage);
        communicationStatus = CommunicationStatus.FAILED;
        // Continue to create the record but mark as failed
      }
    }

    const communication = this.communicationRepository.create({
      ...createCommunicationInput,
      status: communicationStatus,
      whatsappId,
    });
    return this.communicationRepository.save(communication);
  }

  async findAll(): Promise<Communication[]> {
    return this.communicationRepository.find({
      relations: ['application'],
    });
  }

  async findOne(id: string): Promise<Communication | null> {
    return this.communicationRepository.findOne({
      where: { id },
      relations: ['application'],
    });
  }

  async findByApplicationId(applicationId: string): Promise<Communication[]> {
    return this.communicationRepository.find({
      where: { applicationId },
      relations: ['application'],
    });
  }

  async findByUserId(userId: string): Promise<Communication[]> {
    return this.communicationRepository
      .createQueryBuilder('communication')
      .leftJoinAndSelect('communication.application', 'application')
      .where('communication.candidateId = :userId OR communication.companyId = :userId', { userId })
      .getMany();
  }

  async update(id: string, updateCommunicationInput: UpdateCommunicationInput): Promise<Communication | null> {
    await this.communicationRepository.update(id, updateCommunicationInput);
    return this.findOne(id);
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.communicationRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async markAsRead(id: string): Promise<Communication | null> {
    await this.communicationRepository.update(id, { status: CommunicationStatus.READ });
    return this.findOne(id);
  }
}