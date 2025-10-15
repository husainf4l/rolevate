import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Communication, CommunicationType, CommunicationDirection, CommunicationStatus } from './communication.entity';
import { CreateCommunicationInput } from './create-communication.input';
import { UpdateCommunicationInput } from './update-communication.input';
import { WhatsAppService } from '../whatsapp/whatsapp.service';

@Injectable()
export class CommunicationService {
  constructor(
    @InjectRepository(Communication)
    private communicationRepository: Repository<Communication>,
    private readonly whatsappService: WhatsAppService,
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
        console.error('Failed to send WhatsApp message:', error.message);
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