import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    // Generate a unique request ID
    const requestId = uuidv4();
    req['requestId'] = requestId;

    // Store the start time
    const startTime = Date.now();

    // Log the incoming request
    this.logger.log(
      `[${requestId}] ${req.method} ${req.originalUrl} - ${this.getClientIp(req)}`,
    );

    // Log request body in debug mode, but sanitize sensitive data
    if (process.env.NODE_ENV === 'development') {
      const sanitizedBody = this.sanitizeRequestBody({ ...req.body });
      this.logger.debug(`[${requestId}] Request body: ${JSON.stringify(sanitizedBody)}`);
    }

    // Log the response when it's sent
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const contentLength = res.get('content-length') || 0;
      const logMessage = 
        `[${requestId}] ${req.method} ${req.originalUrl} ${res.statusCode} ${contentLength} - ${duration}ms`;

      if (res.statusCode >= 500) {
        this.logger.error(logMessage);
      } else if (res.statusCode >= 400) {
        this.logger.warn(logMessage);
      } else {
        this.logger.log(logMessage);
      }
    });

    next();
  }

  private getClientIp(req: Request): string {
    // Get the client IP, taking into account proxies
    return (
      req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      'unknown'
    ).toString();
  }

  private sanitizeRequestBody(body: any): any {
    // Sanitize sensitive fields
    const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'api_key', 'api_secret'];
    
    if (!body || typeof body !== 'object') return body;
    
    for (const key of Object.keys(body)) {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        body[key] = '[REDACTED]';
      } else if (typeof body[key] === 'object' && body[key] !== null) {
        body[key] = this.sanitizeRequestBody(body[key]);
      }
    }
    
    return body;
  }
}
