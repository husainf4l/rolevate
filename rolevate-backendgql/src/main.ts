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
  
  // CORS Configuration - Allow ALL domains/origins (Most Permissive)
  app.enableCors({
    origin: '*', // Allow all origins - most permissive setting
    credentials: true,
    methods: '*', // Allow all HTTP methods
    allowedHeaders: '*', // Allow all headers
    exposedHeaders: ['Content-Length', 'Content-Type'],
    maxAge: 86400, // Cache preflight for 24 hours
    optionsSuccessStatus: 200,
    preflightContinue: false,
  });
  
  // Additional CORS headers for maximum compatibility
  app.getHttpAdapter().getInstance().addHook('onRequest', (request, reply, done) => {
    reply.header('Access-Control-Allow-Origin', '*');
    reply.header('Access-Control-Allow-Methods', '*');
    reply.header('Access-Control-Allow-Headers', '*');
    reply.header('Access-Control-Allow-Credentials', 'true');
    done();
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
