import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Middleware to add a unique request ID to each incoming request
 * Useful for tracking requests across logs and debugging
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Generate or use existing request ID
    const requestId = req.headers['x-request-id'] || uuidv4();
    
    // Add to request object for use in services
    (req as any).requestId = requestId;
    
    // Add to response headers
    res.setHeader('X-Request-ID', requestId);
    
    next();
  }
}
