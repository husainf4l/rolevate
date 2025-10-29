import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * Interceptor to log all GraphQL operations with timing and error tracking
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('GraphQL');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const gqlContext = GqlExecutionContext.create(context);
    const info = gqlContext.getInfo();
    const request = gqlContext.getContext().req;
    
    const operationType = info?.operation?.operation || 'unknown';
    const operationName = info?.fieldName || 'unknown';
    const userId = request?.user?.id || 'anonymous';
    const userType = request?.user?.userType || 'none';
    const ip = request?.ip || request?.connection?.remoteAddress || 'unknown';
    
    const now = Date.now();
    const timestamp = new Date().toISOString();

    // Log the incoming request
    this.logger.log(
      `→ ${operationType.toUpperCase()} ${operationName} | User: ${userId} (${userType}) | IP: ${ip}`,
    );

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - now;
          this.logger.log(
            `✓ ${operationType.toUpperCase()} ${operationName} | Duration: ${duration}ms | User: ${userId}`,
          );
        },
        error: (error) => {
          const duration = Date.now() - now;
          this.logger.error(
            `✗ ${operationType.toUpperCase()} ${operationName} | Duration: ${duration}ms | User: ${userId} | Error: ${error.message}`,
            error.stack,
          );
        },
      }),
    );
  }
}
