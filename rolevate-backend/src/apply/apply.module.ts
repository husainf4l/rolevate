import { Module } from '@nestjs/common';
import { ApplyController } from './apply.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ApplyController],
})
export class ApplyModule {}
