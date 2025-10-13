import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WhatsAppService } from './whatsapp.service';
import { WhatsAppController } from './whatsapp.controller';
import { TokenManagerService } from './token-manager.service';

@Module({
  imports: [ConfigModule],
  controllers: [WhatsAppController],
  providers: [WhatsAppService, TokenManagerService],
  exports: [WhatsAppService, TokenManagerService],
})
export class WhatsAppModule {}
