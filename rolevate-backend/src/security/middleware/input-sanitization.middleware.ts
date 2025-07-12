import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class InputSanitizationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Sanitize request body
    if (req.body) {
      req.body = this.sanitizeObject(req.body);
    }

    // Sanitize query parameters (mutate in place, do not reassign)
    if (req.query && typeof req.query === 'object') {
      for (const key of Object.keys(req.query)) {
        req.query[key] = this.sanitizeObject(req.query[key]);
      }
    }

    // Sanitize URL parameters (mutate in place, do not reassign)
    if (req.params && typeof req.params === 'object') {
      for (const key of Object.keys(req.params)) {
        req.params[key] = this.sanitizeObject(req.params[key]);
      }
    }

    next();
  }

  private sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
      return this.sanitizeString(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }

    if (typeof obj === 'object' && obj !== null) {
      const sanitized = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = this.sanitizeObject(obj[key]);
        }
      }
      return sanitized;
    }

    return obj;
  }

  private sanitizeString(value: string): string {
    if (typeof value !== 'string') return value;

    // Check for XSS attempts
    if (this.containsXSS(value)) {
      throw new BadRequestException('Input contains potentially malicious XSS content');
    }

    // Check for SQL injection attempts
    if (this.containsSQLInjection(value)) {
      throw new BadRequestException('Input contains potentially malicious SQL content');
    }

    // Check for path traversal attempts
    if (this.containsPathTraversal(value)) {
      throw new BadRequestException('Input contains potentially malicious path content');
    }

    // Basic HTML sanitization
    return this.basicHtmlSanitize(value);
  }

  private containsXSS(value: string): boolean {
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>/gi,
      /<object[^>]*>/gi,
      /<embed[^>]*>/gi,
      /data:text\/html/gi
    ];

    return xssPatterns.some(pattern => pattern.test(value));
  }

  private containsSQLInjection(value: string): boolean {
    // Only flag obvious SQL injection attempts to avoid false positives
    const sqlPatterns = [
      /('\s*(OR|AND)\s*'?\d+\s*'?\s*=\s*'?\d+)/gi,
      /(UNION\s+(ALL\s+)?SELECT)/gi,
      /(\bDROP\s+TABLE\b|\bDELETE\s+FROM\b)/gi,
      /(;\s*(DROP|DELETE|INSERT|UPDATE|CREATE|ALTER))/gi
    ];

    return sqlPatterns.some(pattern => pattern.test(value));
  }

  private containsPathTraversal(value: string): boolean {
    const pathPatterns = [
      /\.\.\//g,
      /\.\.\\/g,
      /%2e%2e%2f/gi,
      /%2e%2e%5c/gi,
      /\.\.%2f/gi,
      /\.\.%5c/gi
    ];

    return pathPatterns.some(pattern => pattern.test(value));
  }

  private basicHtmlSanitize(value: string): string {
    // Remove dangerous HTML but preserve basic formatting
    return value
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
      .replace(/<object[^>]*>.*?<\/object>/gi, '')
      .replace(/<embed[^>]*>.*?<\/embed>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }
}