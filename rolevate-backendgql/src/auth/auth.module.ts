import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { UserModule } from '../user/user.module';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiKeyGuard } from './api-key.guard';
import { BusinessOrApiKeyGuard } from './business-or-api-key.guard';
import { JwtOrApiKeyGuard } from './jwt-or-api-key.guard';
import { AuditService } from '../audit.service';

@Module({
  imports: [
    UserModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'defaultSecret',
        signOptions: { expiresIn: '60m' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, AuthResolver, JwtAuthGuard, ApiKeyGuard, BusinessOrApiKeyGuard, JwtOrApiKeyGuard, AuditService],
  exports: [JwtAuthGuard, ApiKeyGuard, BusinessOrApiKeyGuard, JwtOrApiKeyGuard, JwtModule, AuthService, UserModule],
})
export class AuthModule {}