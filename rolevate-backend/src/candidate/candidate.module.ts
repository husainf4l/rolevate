import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { CandidateController } from './candidate.controller';
import { CandidateService } from './candidate.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AppCacheModule } from '../cache/cache.module';

@Module({
  imports: [
    PrismaModule, 
    AppCacheModule,
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [CandidateController],
  providers: [CandidateService],
  exports: [CandidateService],
})
export class CandidateModule {}
