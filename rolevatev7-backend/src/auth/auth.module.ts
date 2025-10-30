import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { PasswordReset } from './password-reset.entity';
import { UserModule } from '../user/user.module';
import { CommunicationModule } from '../communication/communication.module';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiKeyGuard } from './api-key.guard';
import { BusinessOrApiKeyGuard } from './business-or-api-key.guard';
import { JwtOrApiKeyGuard } from './jwt-or-api-key.guard';
import { AuditService } from '../audit.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PasswordReset]),
    UserModule,
    CommunicationModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret || secret.length < 32) {
          throw new Error('JWT_SECRET must be set in environment variables and be at least 32 characters long');
        }
        return {
          secret,
          signOptions: { 
            expiresIn: '1h',
            issuer: 'rolevate-api',
            audience: 'rolevate-client',
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, AuthResolver, JwtAuthGuard, ApiKeyGuard, BusinessOrApiKeyGuard, JwtOrApiKeyGuard, AuditService],
  exports: [JwtAuthGuard, ApiKeyGuard, BusinessOrApiKeyGuard, JwtOrApiKeyGuard, JwtModule, AuthService, UserModule],
})
export class AuthModule {}