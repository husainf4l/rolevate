import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

export interface SecurityEvent {
  type: 'AUTH_FAILURE' | 'AUTH_SUCCESS' | 'UNAUTHORIZED_ACCESS' | 'DATA_BREACH_ATTEMPT' | 'SUSPICIOUS_ACTIVITY';
  userId?: string;
  ip: string;
  userAgent?: string;
  details: Record<string, any>;
  timestamp: Date;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface SecurityMetrics {
  failedLogins: number;
  suspiciousActivities: number;
  dataAccess: number;
  lastIncident?: Date;
}

@Injectable()
export class SecurityService {
  private readonly logger = new Logger(SecurityService.name);
  private readonly encryptionKey = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
  
  constructor(private prisma: PrismaService) {}

  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      // Log to application logs
      this.logger.warn(`Security Event: ${event.type}`, {
        type: event.type,
        userId: event.userId,
        ip: this.anonymizeIP(event.ip),
        severity: event.severity,
        timestamp: event.timestamp,
      });

      // Store in database for audit trail
      await this.prisma.$executeRaw`
        INSERT INTO security_logs (type, user_id, ip_hash, user_agent_hash, details, severity, created_at)
        VALUES (${event.type}, ${event.userId}, ${this.hashData(event.ip)}, 
                ${event.userAgent ? this.hashData(event.userAgent) : null}, 
                ${JSON.stringify(event.details)}, ${event.severity}, ${event.timestamp})
      `;

      // Alert on critical events
      if (event.severity === 'CRITICAL') {
        await this.triggerSecurityAlert(event);
      }
    } catch (error) {
      this.logger.error('Failed to log security event', error);
    }
  }

  async getSecurityMetrics(timeframe: 'hour' | 'day' | 'week' = 'day'): Promise<SecurityMetrics> {
    const now = new Date();
    const timeOffset = {
      hour: 1 * 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
    };

    const since = new Date(now.getTime() - timeOffset[timeframe]);

    try {
      const metrics = await this.prisma.$queryRaw<Array<{ type: string; count: number }>>`
        SELECT type, COUNT(*) as count 
        FROM security_logs 
        WHERE created_at >= ${since}
        GROUP BY type
      `;

      const failedLogins = metrics.find(m => m.type === 'AUTH_FAILURE')?.count || 0;
      const suspiciousActivities = metrics.find(m => m.type === 'SUSPICIOUS_ACTIVITY')?.count || 0;
      const dataAccess = metrics.find(m => m.type === 'DATA_BREACH_ATTEMPT')?.count || 0;

      const lastIncident = await this.prisma.$queryRaw<Array<{ created_at: Date }>>`
        SELECT created_at 
        FROM security_logs 
        WHERE severity IN ('HIGH', 'CRITICAL')
        ORDER BY created_at DESC 
        LIMIT 1
      `;

      return {
        failedLogins: Number(failedLogins),
        suspiciousActivities: Number(suspiciousActivities),
        dataAccess: Number(dataAccess),
        lastIncident: lastIncident[0]?.created_at,
      };
    } catch (error) {
      this.logger.error('Failed to get security metrics', error);
      return { failedLogins: 0, suspiciousActivities: 0, dataAccess: 0 };
    }
  }

  encryptData(data: string): string {
    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  decryptData(encryptedData: string): string {
    const [ivHex, encrypted] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  hashData(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  private anonymizeIP(ip: string): string {
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
    }
    return 'anonymized';
  }

  private async triggerSecurityAlert(event: SecurityEvent): Promise<void> {
    // In production, integrate with alerting systems (email, Slack, etc.)
    this.logger.error('CRITICAL SECURITY ALERT', {
      type: event.type,
      details: event.details,
      timestamp: event.timestamp,
    });
  }

  async validateDataIntegrity(tableName: string, recordId: string): Promise<boolean> {
    // Implement data integrity checks
    // This is a placeholder for checksum validation
    return true;
  }

  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  validatePassword(password: string): { valid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    if (password.length < 8) {
      issues.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      issues.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      issues.push('Password must contain at least one lowercase letter');
    }
    if (!/\d/.test(password)) {
      issues.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password)) {
      issues.push('Password must contain at least one special character');
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }
}