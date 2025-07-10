import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { CompanyModule } from './company/company.module';
import { AiautocompleteModule } from './aiautocomplete/aiautocomplete.module';
import { JobModule } from './job/job.module';
import { AppCacheModule } from './cache/cache.module';

@Module({
  imports: [PrismaModule, AuthModule, UserModule, CompanyModule, AiautocompleteModule, JobModule, AppCacheModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
