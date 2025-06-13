import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe, LogLevel } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
 import * as cookieParser from 'cookie-parser';
import * as path from 'path';
import * as fs from 'fs';


function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  // Configure log levels based on environment
  const logLevels: LogLevel[] = ['error', 'warn', 'log'];
  
  // Add debug log level in development environment
  if (process.env.NODE_ENV !== 'production') {
    logLevels.push('debug', 'verbose');
    logger.log('Running in development mode with debug logging enabled');
  }
  
  // Create application with configured logger
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: logLevels,
  });
  
  // Ensure required directories exist
  ensureDirectoryExists(path.join(__dirname, '..', 'audio-output'));
  ensureDirectoryExists(path.join(__dirname, '..', 'uploads'));
  ensureDirectoryExists(path.join(__dirname, '..', 'public'));
  
  // Add cookie parser middleware
  app.use(cookieParser());
  
  // Configure CORS for frontend integration
  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  });
  
  // Apply global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  
  
  // Set global prefix for all routes
  app.setGlobalPrefix('api');
  
  // Serve static files from the audio-output directory
  app.useStaticAssets(path.join(__dirname, '..', 'audio-output'), {
    prefix: '/audio-files',
  });
  
  // Serve static files from the uploads directory
  app.useStaticAssets(path.join(__dirname, '..', 'uploads'), {
    prefix: '/uploads', // Keep original for backward compatibility
  });
  
  // Add specific route for CV files to be accessible at /api/upload (singular)
  app.useStaticAssets(path.join(__dirname, '..', 'uploads/cvs'), {
    prefix: '/api/upload', // Changed from /api/uploads to /api/upload to match the expected URL
  });
  
  // Serve static files from the public directory
  app.useStaticAssets(path.join(__dirname, '..', 'public'), {
    prefix: '/public',
  });
  
  const port = process.env.PORT || 4005;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
