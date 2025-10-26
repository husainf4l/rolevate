import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './global-exception.filter';

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
  
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new GlobalExceptionFilter());
  
  // CORS Configuration - Accept all origins for development
  // TODO: Restrict to specific origins in production
  app.enableCors({
    origin: true, // Accept all origins (for development)
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'Apollo-Require-Preflight'],
  });
  
  // Set Referrer-Policy header
  app.getHttpAdapter().getInstance().addHook('onSend', (request, reply, payload, done) => {
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
