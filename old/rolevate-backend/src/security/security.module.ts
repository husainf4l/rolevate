import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { SecurityService } from './security.service';
import { SecurityLoggerMiddleware } from './middleware/security-logger.middleware';
import { InputSanitizationMiddleware } from './middleware/input-sanitization.middleware';
import { SecurityController } from './security.controller';

@Module({
  providers: [SecurityService],
  controllers: [SecurityController],
  exports: [SecurityService],
})
export class SecurityModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(InputSanitizationMiddleware, SecurityLoggerMiddleware)
      .forRoutes('*');
  }
}