import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SecurityLog } from './security-log.entity';
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
    return this.securityLogRepository.find();
  }

  async findOne(id: string): Promise<SecurityLog | null> {
    return this.securityLogRepository.findOne({
      where: { id },
    });
  }

  async findByUserId(userId: string): Promise<SecurityLog[]> {
    return this.securityLogRepository.find({
      where: { userId },
    });
  }

  async findByType(type: string): Promise<SecurityLog[]> {
    return this.securityLogRepository.find({
      where: { type },
    });
  }

  async findBySeverity(severity: string): Promise<SecurityLog[]> {
    return this.securityLogRepository.find({
      where: { severity },
    });
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.securityLogRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}