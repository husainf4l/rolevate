import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { SecurityService } from '../security.service';
import { Request } from 'express';

@Injectable()
export class SecurityAuditInterceptor implements NestInterceptor {
  constructor(private securityService: SecurityService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const handler = context.getHandler();
    const className = context.getClass().name;
    const handlerName = handler.name;
    
    const ip = this.getClientIP(request);
    const userAgent = request.get('User-Agent');
    const user = (request as any).user;

    // Log access to sensitive operations
    if (this.isSensitiveOperation(className, handlerName)) {
      this.securityService.logSecurityEvent({
        type: 'UNAUTHORIZED_ACCESS',
        userId: user?.userId,
        ip,
        userAgent,
        details: {
          controller: className,
          method: handlerName,
          endpoint: `${request.method} ${request.url}`,
          userType: user?.userType,
        },
        timestamp: new Date(),
        severity: 'MEDIUM',
      });
    }

    return next.handle().pipe(
      tap(() => {
        // Log successful operations on sensitive data
        if (this.isDataModification(request.method)) {
          this.securityService.logSecurityEvent({
            type: 'SUSPICIOUS_ACTIVITY',
            userId: user?.userId,
            ip,
            userAgent,
            details: {
              action: 'data_modification',
              method: request.method,
              endpoint: request.url,
              controller: className,
              handler: handlerName,
            },
            timestamp: new Date(),
            severity: 'LOW',
          });
        }
      }),
      catchError((error) => {
        // Log failed operations that might indicate attacks
        this.securityService.logSecurityEvent({
          type: 'SUSPICIOUS_ACTIVITY',
          userId: user?.userId,
          ip,
          userAgent,
          details: {
            action: 'operation_failed',
            error: error.message,
            endpoint: request.url,
            controller: className,
            handler: handlerName,
          },
          timestamp: new Date(),
          severity: 'HIGH',
        });
        throw error;
      }),
    );
  }

  private getClientIP(request: Request): string {
    return (request.headers['x-forwarded-for'] as string)?.split(',')[0] ||
           request.headers['x-real-ip'] as string ||
           request.connection.remoteAddress ||
           'unknown';
  }

  private isSensitiveOperation(className: string, handlerName: string): boolean {
    const sensitiveOperations = [
      'delete',
      'remove',
      'admin',
      'security',
      'user',
      'auth',
      'password',
      'token',
    ];

    const combinedName = `${className}.${handlerName}`.toLowerCase();
    return sensitiveOperations.some(op => combinedName.includes(op));
  }

  private isDataModification(method: string): boolean {
    return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase());
  }
}