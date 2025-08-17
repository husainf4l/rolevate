import { Module } from '@nestjs/common';
import { AiautocompleteController } from './aiautocomplete.controller';
import { AiautocompleteService } from './aiautocomplete.service';
import { AiConfigService } from './ai-config.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [AiautocompleteController],
  providers: [AiautocompleteService, AiConfigService, PrismaService],
  exports: [AiautocompleteService, AiConfigService],
})
export class AiautocompleteModule {}