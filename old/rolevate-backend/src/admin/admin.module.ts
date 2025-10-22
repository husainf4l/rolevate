import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AppCacheModule } from '../cache/cache.module';
import { NotificationModule } from '../notification/notification.module';
import { SecurityModule } from '../security/security.module';

@Module({
  imports: [
    PrismaModule,
    AppCacheModule,
    NotificationModule,
    SecurityModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
