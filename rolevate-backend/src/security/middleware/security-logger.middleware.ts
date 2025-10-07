import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SecurityService } from '../security.service';

@Injectable()
export class SecurityLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SecurityLoggerMiddleware.name);

  constructor(private securityService: SecurityService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    const ip = this.getClientIP(req);
    const userAgent = req.get('User-Agent') || 'unknown';
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      const statusCode = res.statusCode;
      
      // Log security-relevant events
      if (statusCode === 401 || statusCode === 403) {
        this.securityService.logSecurityEvent({
          type: statusCode === 401 ? 'UNAUTHORIZED_ACCESS' : 'UNAUTHORIZED_ACCESS',
          ip,
          userAgent,
          details: {
            method: req.method,
            url: this.sanitizeUrl(req.url),
            statusCode,
            duration,
          },
          timestamp: new Date(),
          severity: 'MEDIUM',
        });
      }

      // Log suspicious patterns
      if (this.isSuspiciousRequest(req, statusCode)) {
        this.securityService.logSecurityEvent({
          type: 'SUSPICIOUS_ACTIVITY',
          ip,
          userAgent,
          details: {
            method: req.method,
            url: this.sanitizeUrl(req.url),
            statusCode,
            suspiciousPattern: this.detectSuspiciousPattern(req),
          },
          timestamp: new Date(),
          severity: 'HIGH',
        });
      }

      // Log access to sensitive endpoints
      if (this.isSensitiveEndpoint(req.url)) {
        this.logger.log(`Sensitive endpoint access: ${req.method} ${this.sanitizeUrl(req.url)} - ${statusCode}`, {
          ip: this.anonymizeIP(ip),
          userAgent: userAgent.substring(0, 100),
          statusCode,
        });
      }
    });

    next();
  }

  private getClientIP(req: Request): string {
    return (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
           req.headers['x-real-ip'] as string ||
           req.connection.remoteAddress ||
           req.socket.remoteAddress ||
           'unknown';
  }

  private sanitizeUrl(url: string): string {
    // Remove sensitive data from URLs for logging
    return url
      .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '/[UUID]')
      .replace(/token=[^&]+/gi, 'token=[REDACTED]')
      .replace(/password=[^&]+/gi, 'password=[REDACTED]')
      .replace(/key=[^&]+/gi, 'key=[REDACTED]');
  }

  private anonymizeIP(ip: string): string {
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
    }
    return 'anonymized';
  }

  private isSuspiciousRequest(req: Request, statusCode: number): boolean {
    const url = req.url.toLowerCase();
    const _method = req.method;
    
    // SQL injection patterns
    if (url.includes('union') || url.includes('select') || url.includes('drop')) {
      return true;
    }
    
    // XSS patterns
    if (url.includes('<script') || url.includes('javascript:')) {
      return true;
    }
    
    // Path traversal
    if (url.includes('../') || url.includes('..\\')) {
      return true;
    }
    
    // Excessive requests to auth endpoints
    if (url.includes('/auth/') && statusCode >= 400) {
      return true;
    }
    
    // Admin panel access attempts
    if (url.includes('/admin') || url.includes('/wp-admin')) {
      return true;
    }
    
    return false;
  }

  private detectSuspiciousPattern(req: Request): string {
    const url = req.url.toLowerCase();
    
    if (url.includes('union') || url.includes('select')) return 'SQL_INJECTION_ATTEMPT';
    if (url.includes('<script') || url.includes('javascript:')) return 'XSS_ATTEMPT';
    if (url.includes('../')) return 'PATH_TRAVERSAL_ATTEMPT';
    if (url.includes('/admin')) return 'ADMIN_ACCESS_ATTEMPT';
    
    return 'UNKNOWN_SUSPICIOUS_PATTERN';
  }

  private isSensitiveEndpoint(url: string): boolean {
    const sensitivePatterns = [
      '/auth/',
      '/user/',
      '/admin/',
      '/company/',
      '/uploads/',
      '/candidate/',
    ];
    
    return sensitivePatterns.some(pattern => url.includes(pattern));
  }
}