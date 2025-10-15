import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Communication } from './communication.entity';
import { CreateCommunicationInput } from './create-communication.input';
import { UpdateCommunicationInput } from './update-communication.input';

@Injectable()
export class CommunicationService {
  constructor(
    @InjectRepository(Communication)
    private communicationRepository: Repository<Communication>,
  ) {}

  async create(createCommunicationInput: CreateCommunicationInput): Promise<Communication> {
    const communication = this.communicationRepository.create(createCommunicationInput);
    return this.communicationRepository.save(communication);
  }

  async findAll(): Promise<Communication[]> {
    return this.communicationRepository.find({
      relations: ['application', 'sender', 'recipient'],
    });
  }

  async findOne(id: string): Promise<Communication | null> {
    return this.communicationRepository.findOne({
      where: { id },
      relations: ['application', 'sender', 'recipient'],
    });
  }

  async findByApplicationId(applicationId: string): Promise<Communication[]> {
    return this.communicationRepository.find({
      where: { applicationId },
      relations: ['application', 'sender', 'recipient'],
    });
  }

  async findByUserId(userId: string): Promise<Communication[]> {
    return this.communicationRepository
      .createQueryBuilder('communication')
      .leftJoinAndSelect('communication.application', 'application')
      .leftJoinAndSelect('communication.sender', 'sender')
      .leftJoinAndSelect('communication.recipient', 'recipient')
      .where('communication.senderId = :userId OR communication.recipientId = :userId', { userId })
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
    await this.communicationRepository.update(id, { isRead: true });
    return this.findOne(id);
  }
}