import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class SanitizationPipe implements PipeTransform {
  transform(value: any, _metadata: ArgumentMetadata) {
    if (typeof value === 'string') {
      // Basic XSS protection
      if (this.containsXSS(value)) {
        throw new BadRequestException('Input contains potentially malicious content');
      }

      // Basic SQL injection protection
      if (this.containsSQLInjection(value)) {
        throw new BadRequestException('Input contains potentially malicious SQL content');
      }

      // Path traversal protection
      if (this.containsPathTraversal(value)) {
        throw new BadRequestException('Input contains potentially malicious path content');
      }

      // Sanitize HTML tags (but allow safe ones)
      return this.sanitizeHtml(value);
    }

    if (typeof value === 'object' && value !== null) {
      return this.sanitizeObject(value);
    }

    return value;
  }

  private containsXSS(value: string): boolean {
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /<object[^>]*>.*?<\/object>/gi,
      /<embed[^>]*>.*?<\/embed>/gi
    ];

    return xssPatterns.some(pattern => pattern.test(value));
  }

  private containsSQLInjection(value: string): boolean {
    // Skip SQL injection check for WhatsApp template messages and communication content
    if (this.isWhatsAppContent(value)) {
      return false;
    }

    const sqlPatterns = [
      /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bDELETE\b|\bUPDATE\b|\bDROP\b|\bCREATE\b|\bALTER\b)/gi,
      /(\bOR\b|\bAND\b)\s+\d+\s*=\s*\d+/gi,
      /'\s*(OR|AND)\s*'[^']*'\s*=\s*'[^']*'/gi,
      /;\s*(DROP|DELETE|UPDATE|INSERT|CREATE|ALTER)/gi
    ];

    return sqlPatterns.some(pattern => pattern.test(value));
  }

  private isWhatsAppContent(value: string): boolean {
    // Allow content that looks like WhatsApp templates or communication content
    const whatsappPatterns = [
      /template:/i,
      /interview invitation/i,
      /cv.*received/i,
      /thank you for/i,
      /application.*received/i,
      /room_interview_/i,
      /\?phone=\d+/i,
      /jobId=/i,
      /roomName=/i
    ];

    return whatsappPatterns.some(pattern => pattern.test(value));
  }

  private containsPathTraversal(value: string): boolean {
    const pathPatterns = [
      /\.\.\//g,
      /\.\.\\/g,
      /%2e%2e%2f/gi,
      /%2e%2e%5c/gi
    ];

    return pathPatterns.some(pattern => pattern.test(value));
  }

  private sanitizeHtml(value: string): string {
    // Remove dangerous HTML tags and attributes
    return value
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
      .replace(/<object[^>]*>.*?<\/object>/gi, '')
      .replace(/<embed[^>]*>.*?<\/embed>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }

  private sanitizeObject(obj: any): any {
    const sanitized = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const sanitizedKey = typeof key === 'string' ? this.transform(key, {} as ArgumentMetadata) : key;
        const sanitizedValue = this.transform(obj[key], {} as ArgumentMetadata);
        sanitized[sanitizedKey] = sanitizedValue;
      }
    }
    return sanitized;
  }
}