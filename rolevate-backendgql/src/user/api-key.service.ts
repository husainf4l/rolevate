import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { ApiKey } from './api-key.entity';
import { CreateApiKeyInput } from './create-api-key.input';
import { ApiKeyDto } from './api-key.dto';
import { AuditService } from '../audit.service';

@Injectable()
export class ApiKeyService {
  constructor(
    @InjectRepository(ApiKey)
    private apiKeyRepository: Repository<ApiKey>,
    private auditService: AuditService,
  ) {}

  async generateApiKey(userId: string, input: CreateApiKeyInput): Promise<ApiKeyDto> {
    const key = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1); // 1 year expiration
    const apiKey = this.apiKeyRepository.create({
      key,
      name: input.name,
      expiresAt,
      userId,
    });
    const savedKey = await this.apiKeyRepository.save(apiKey);
    this.auditService.logApiKeyGeneration(userId, savedKey.id);
    return {
      id: savedKey.id,
      key: savedKey.key,
      name: savedKey.name,
      isActive: savedKey.isActive,
      createdAt: savedKey.createdAt,
      expiresAt: savedKey.expiresAt,
      userId: savedKey.userId,
    };
  }

  async findAllByUser(userId: string): Promise<ApiKeyDto[]> {
    const keys = await this.apiKeyRepository.find({ where: { userId } });
    return keys.map(key => ({
      id: key.id,
      key: key.key,
      name: key.name,
      isActive: key.isActive,
      createdAt: key.createdAt,
      expiresAt: key.expiresAt,
      userId: key.userId,
    }));
  }

  async revokeApiKey(userId: string, keyId: string): Promise<boolean> {
    const result = await this.apiKeyRepository.update(
      { id: keyId, userId },
      { isActive: false }
    );
    if ((result.affected ?? 0) > 0) {
      this.auditService.logApiKeyRevocation(userId, keyId);
    }
    return (result.affected ?? 0) > 0;
  }

  async validateApiKey(key: string): Promise<boolean> {
    const apiKey = await this.apiKeyRepository.findOne({ where: { key, isActive: true } });
    if (!apiKey) return false;
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) return false;
    return true;
  }
}