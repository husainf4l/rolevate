import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { SubscriptionGuard } from './guards/subscription.guard';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthSubscriptionAdapter } from './auth-subscription.service';
import { SubscriptionModule } from '../subscription/subscription.module';
@Module({
  imports: [
    PrismaModule,
    PassportModule,
    ConfigModule,
    forwardRef(() => SubscriptionModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'your-super-secret-jwt-key',
        signOptions: { 
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '24h' 
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, SubscriptionGuard, AuthSubscriptionAdapter],
  exports: [AuthService, SubscriptionGuard, AuthSubscriptionAdapter],
})
export class AuthModule {}
