import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Notification } from './notification.entity';
import { NotificationSettings } from './notification-settings.entity';
import { NotificationService } from './notification.service';
import { NotificationResolver } from './notification.resolver';
import { AuditService } from '../audit.service';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { AUTH } from '../common/constants/config.constants';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, NotificationSettings]),
    AuthModule,
    UserModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'defaultSecret',
        signOptions: { expiresIn: AUTH.JWT_EXPIRY },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [NotificationService, NotificationResolver, AuditService],
  exports: [NotificationService],
})
export class NotificationModule {}