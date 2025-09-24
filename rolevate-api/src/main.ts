import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('backend');
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });
  app.use(cookieParser());

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  const config = new DocumentBuilder()
    .setTitle('Rolevate API')
    .setDescription('The Rolevate API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management endpoints')
    .addTag('organizations', 'Organization management')
    .addTag('jobs', 'Job management')
    .addTag('applications', 'Application management')
    .addTag('interviews', 'Interview management')
    .addTag('calls', 'Video call management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('backend/api-docs', app, document);

  const port = process.env.PORT ?? 4005;
  await app.listen(port);

  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📚 Swagger docs available at http://localhost:${port}/backend/api-docs`);
}
bootstrap();
