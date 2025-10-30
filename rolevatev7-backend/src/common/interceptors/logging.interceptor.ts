import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('GraphQL');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const gqlContext = GqlExecutionContext.create(context);
    const info = gqlContext.getInfo();
    const ctx = gqlContext.getContext();
    
    const operationType = info.operation.operation.toUpperCase();
    const operationName = info.fieldName;
    const user = ctx.req?.user;
    const userId = user?.id || 'anonymous';
    const userType = user?.userType || 'none';
    const ip = ctx.req?.ip || ctx.req?.connection?.remoteAddress;
    const requestId = ctx.req?.requestId;

    const startTime = Date.now();

    this.logger.log(
      `→ ${operationType} ${operationName} | User: ${userId} (${userType}) | IP: ${ip}${requestId ? ` | RequestId: ${requestId}` : ''}`
    );

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        this.logger.log(
          `✓ ${operationType} ${operationName} | Duration: ${duration}ms | User: ${userId}`
        );
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        this.logger.error(
          `✗ ${operationType} ${operationName} | Duration: ${duration}ms | User: ${userId} | Error: ${error.message}`
        );
        throw error;
      })
    );
  }
}
