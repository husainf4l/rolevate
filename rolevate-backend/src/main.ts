import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import * as compression from 'compression';
import rateLimit from 'express-rate-limit';
import * as dotenv from 'dotenv';
import { GlobalExceptionFilter } from './common/global-exception.filter';

// Load environment variables
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'], // Reduced logging for security
  });

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://unpkg.com"],
        imgSrc: ["'self'", 'data:', 'https:', 'http://localhost:3005', 'http://localhost:4005', 'http://localhost:3000', 'http://localhost:4200', 'https://admin.rolevate.com'],
        connectSrc: ["'self'", 'http://localhost:3005', 'http://localhost:4005', 'http://localhost:3000', 'http://localhost:4200', 'https://admin.rolevate.com', 'wss://rolvate2-ckmk80qb.livekit.cloud', 'https://rolvate2-ckmk80qb.livekit.cloud'],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }));

  // Compression
  app.use(compression());

  // Trust proxy (needed when behind reverse proxy/load balancer)
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', true);

  // Rate limiting - Environment specific
  const isProduction = process.env.NODE_ENV === 'production';
  const rateLimitConfig = {
    windowMs: 60 * 60 * 1000, // 1 hour (60 minutes)
    max: isProduction ? 1000 : 10000, // Stricter limit in production (1000 vs 10000)
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: 'Rate limit exceeded. Try again in 1 hour.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip rate limiting for health checks and static assets
    skip: (req: any) => {
      const skipPaths = ['/api/health', '/api/admin/health', '/favicon.ico'];
      return skipPaths.some(path => req.path.includes(path));
    }
  };

  app.use(rateLimit(rateLimitConfig));

  app.use(cookieParser());

  // Secure CORS configuration
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3005',
    'http://localhost:3000',
    'https://rolevate.com',
    'https://www.rolevate.com',
    'https://admin.rolevate.com'
  ];

  console.log('Allowed CORS origins:', allowedOrigins);

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      console.log('CORS request from origin:', origin);

      // Allow requests with no origin in development (for testing tools)
      if (!origin) {
        console.log('Allowing request with no origin');
        callback(null, true);
        return;
      }

      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        console.log('Origin allowed:', origin);
        callback(null, true);
      } else {
        console.log('Origin blocked:', origin);
        callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Length', 'Content-Type'],
    optionsSuccessStatus: 200 // Some legacy browsers choke on 204
  });

  // Enhanced validation
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    forbidUnknownValues: true,
    disableErrorMessages: process.env.NODE_ENV === 'production',
  }));

  app.setGlobalPrefix('api');

  // Swagger/OpenAPI Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('RoleVate API')
    .setDescription('RoleVate Backend API for Job Matching and Recruitment Platform')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('companies', 'Company management')
    .addTag('jobs', 'Job postings and management')
    .addTag('applications', 'Job applications')
    .addTag('candidates', 'Candidate profiles')
    .addTag('interviews', 'Interview management')
    .addTag('communication', 'Communication and messaging')
    .addTag('uploads', 'File upload handling')
    .addTag('admin', 'Administrative functions')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addServer('http://localhost:4005', 'Development server')
    .addServer('https://api.rolevate.com', 'Production server')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
      showExtensions: true,
    },
    customSiteTitle: 'RoleVate API Documentation',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #3b4151 }
    `,
    customfavIcon: '/favicon.ico',
  });

  await app.listen(process.env.PORT ?? 4005);

  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap().catch((error) => {
  console.error('Application failed to start:', error);
  process.exit(1);
});
