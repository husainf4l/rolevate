import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';

/**
 * Request Logger Middleware
 * Logs all incoming HTTP requests and their responses
 * Includes: method, URL, status code, response time, IP, user agent
 */
@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: FastifyRequest['raw'], res: FastifyReply['raw'], next: () => void) {
    const { method, url } = req;
    const startTime = Date.now();
    const ip = req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'] || 'unknown';
    const requestLogger = this.logger;

    // Log incoming request
    requestLogger.log(`→ ${method} ${url} - ${ip}`);

    // Capture response when finished
    res.on('finish', () => {
      const responseTime = Date.now() - startTime;
      const statusCode = res.statusCode;

      // Log response
      const statusEmoji = statusCode >= 500 ? '❌' : statusCode >= 400 ? '⚠️' : '✓';
      requestLogger.log(
        `${statusEmoji} ${method} ${url} ${statusCode} ${responseTime}ms - ${ip}`
      );

      // Log errors with more detail
      if (statusCode >= 400) {
        requestLogger.debug(`User Agent: ${userAgent}`);
      }
    });

    next();
  }
}
