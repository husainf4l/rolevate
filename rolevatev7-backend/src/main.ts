import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './global-exception.filter';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AuditService } from './audit.service';
import { RequestLoggerMiddleware } from './common/middleware/request-logger.middleware';
import helmet from '@fastify/helmet';

/**
 * BEST PRACTICE FOR APOLLO SERVER 5 + FASTIFY:
 * File uploads via base64 encoding - no multipart plugin needed!
 * 
 * Apollo Server 4+ removed built-in file upload support.
 * Modern approach: Send files as base64 strings in GraphQL mutations.
 */

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  const fastifyAdapter = new FastifyAdapter({
    bodyLimit: 50 * 1024 * 1024, // 50MB limit (allows ~37MB original files after base64 encoding)
  });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyAdapter,
  );

  // Use the local logger instance instead of resolving Logger from DI
  app.useLogger(logger);
  
  // Security: Register Helmet for security headers
  const fastifyInstance = app.getHttpAdapter().getInstance();
  await fastifyInstance.register(helmet as any, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [`'self'`],
        styleSrc: [`'self'`, `'unsafe-inline'`],
        imgSrc: [`'self'`, 'data:', 'https:'],
        scriptSrc: [`'self'`, `'unsafe-inline'`, `'unsafe-eval'`], // Needed for GraphQL Playground
        connectSrc: [`'self'`, 'https://apollo-server-landing-page.cdn.apollographql.com'],
      },
    },
    crossOriginEmbedderPolicy: false, // Disable for GraphQL Playground
  });
  
  logger.log('🔒 Security headers configured with Helmet');
  
  app.setGlobalPrefix('api');
  
  // Apply request logging middleware
  const requestLogger = new RequestLoggerMiddleware();
  app.use((req: any, res: any, next: any) => requestLogger.use(req, res, next));
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Strip properties that don't have decorators
    forbidNonWhitelisted: true, // Throw error if non-whitelisted values are provided
    transform: true, // Automatically transform payloads to DTO instances
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));
  
  // Get services for global filters
  const configService = app.get(ConfigService);
  const auditService = app.get(AuditService);
  
  // Apply global exception filters
  app.useGlobalFilters(
    new GlobalExceptionFilter(configService),
    new HttpExceptionFilter(auditService),
  );
  
  // CORS Configuration - Secure setup with environment-based origins
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || ['http://localhost:3000'];
  
  logger.log(`✅ CORS allowed origins: ${allowedOrigins.join(', ')}`);
  
  // For development, optionally allow all origins (NOT for production!)
  const corsOriginFn = process.env.NODE_ENV === 'development' 
    ? true // Allow all origins in development
    : allowedOrigins; // Restrict in production
  
  app.enableCors({
    origin: corsOriginFn,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'x-request-id', 'apollo-require-preflight'],
    exposedHeaders: ['Content-Length', 'Content-Type', 'x-request-id'],
    maxAge: 86400, // Cache preflight for 24 hours
    optionsSuccessStatus: 200,
    preflightContinue: false,
  });
  
  // Set Referrer-Policy header
  app.getHttpAdapter().getInstance().addHook('onSend', (_request, reply, _payload, done) => {
    reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    done();
  });
  
  const port = process.env.PORT || 4005;
  await app.listen(port, '0.0.0.0');
  
  const url = await app.getUrl();
  logger.log(`🚀 Application is running on: ${url}`);
  logger.log(`📊 GraphQL Playground: ${url}/api/graphql`);
  logger.log(`🏥 Environment: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap().catch((error) => {
  const logger = new Logger('Bootstrap');
  logger.error('Failed to start application', error.stack);
  process.exit(1);
});
