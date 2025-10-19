import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
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
  const fastifyAdapter = new FastifyAdapter({
    bodyLimit: 50 * 1024 * 1024, // 50MB limit (allows ~37MB original files after base64 encoding)
  });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyAdapter,
  );
  
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Allow localhost and 127.0.0.1 on any port for development
      if (origin.match(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/)) {
        return callback(null, true);
      }
      
      // Allow specific origins from environment or defaults
      const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3005', 'http://127.0.0.1:3000'];
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'Apollo-Require-Preflight'],
  });
  
  // Set Referrer-Policy header
  app.getHttpAdapter().getInstance().addHook('onSend', (request, reply, payload, done) => {
    reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    done();
  });
  
  await app.listen(process.env.PORT || 4005, '0.0.0.0');
  console.log(`🚀 Application is running on: ${await app.getUrl()}`);
}
bootstrap();
