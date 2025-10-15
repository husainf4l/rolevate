import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SecurityLog, SecurityAction } from './security-log.entity';
import { CreateSecurityLogInput } from './create-security-log.input';

@Injectable()
export class SecurityLogService {
  constructor(
    @InjectRepository(SecurityLog)
    private securityLogRepository: Repository<SecurityLog>,
  ) {}

  async create(createSecurityLogInput: CreateSecurityLogInput): Promise<SecurityLog> {
    const securityLog = this.securityLogRepository.create(createSecurityLogInput);
    return this.securityLogRepository.save(securityLog);
  }

  async findAll(): Promise<SecurityLog[]> {
    return this.securityLogRepository.find({
      relations: ['user'],
    });
  }

  async findOne(id: string): Promise<SecurityLog | null> {
    return this.securityLogRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async findByUserId(userId: string): Promise<SecurityLog[]> {
    return this.securityLogRepository.find({
      where: { userId },
      relations: ['user'],
    });
  }

  async findByAction(action: SecurityAction): Promise<SecurityLog[]> {
    return this.securityLogRepository.find({
      where: { action },
      relations: ['user'],
    });
  }

  async findByResource(resource: string): Promise<SecurityLog[]> {
    return this.securityLogRepository.find({
      where: { resource },
      relations: ['user'],
    });
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.securityLogRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}