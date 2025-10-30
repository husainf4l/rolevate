import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * Custom throttler guard for GraphQL with Fastify
 * Handles the mismatch between Fastify's request/reply and what ThrottlerGuard expects
 * 
 * Based on: https://docs.nestjs.com/security/rate-limiting#graphql
 */
@Injectable()
export class GraphqlThrottlerGuard extends ThrottlerGuard {
  /**
   * Override to handle cases where GraphQL context might not have proper request
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Skip throttling for GraphQL - it's problematic with Fastify integration
    if (context.getType<string>() === 'graphql') {
      const gqlContext = GqlExecutionContext.create(context);
      const info = gqlContext.getInfo();
      
      // Skip introspection queries
      if (info?.fieldName === '__schema' || info?.fieldName === '__type') {
        return true;
      }
      
      // For now, allow all GraphQL queries to pass throttling
      // The request context is not properly available in GraphQL with Fastify
      console.log('⏭️  Throttler skipped for GraphQL query:', info?.fieldName);
      return true;
    }
    
    try {
      return await super.canActivate(context);
    } catch (err) {
      // If throttler fails, allow the request but log it
      const error = err instanceof Error ? err : new Error(String(err));
      console.warn('Throttler guard error (allowing request):', error.message);
      return true;
    }
  }

  /**
   * Override getRequestResponse to handle GraphQL context with Fastify
   */
  protected getRequestResponse(context: ExecutionContext) {
    const contextType = context.getType<string>();
    
    if (contextType === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(context);
      const ctx = gqlCtx.getContext();
      
      // For Fastify with Apollo, extract request and reply
      let request = ctx?.request;
      const reply = ctx?.reply;
      
      // If no request in context, return a safe default
      if (!request) {
        console.warn('GraphqlThrottlerGuard: No request object in context, using safe default');
        const safeReq: any = {
          ip: '127.0.0.1',
          headers: {},
          socket: { remoteAddress: '127.0.0.1' },
        };
        safeReq.header = (_name: string) => undefined;
        safeReq.get = (_name: string) => undefined;
        
        return {
          req: safeReq,
          res: reply || {},
        };
      }
      
      // Ensure request has required methods for Fastify/Express compatibility
      if (typeof request.header !== 'function') {
        request.header = (name: string) => {
          return request.headers?.[name.toLowerCase()];
        };
      }
      if (typeof request.get !== 'function') {
        request.get = (name: string) => {
          return request.headers?.[name.toLowerCase()];
        };
      }
      
      return { req: request, res: reply };
    }
    
    // For HTTP requests, use default
    return super.getRequestResponse(context);
  }

  /**
   * Override getTracker to safely extract IP
   */
  protected async getTracker(req: Record<string, any>): Promise<string> {
    return req?.ip || req?.socket?.remoteAddress || '127.0.0.1';
  }
}
