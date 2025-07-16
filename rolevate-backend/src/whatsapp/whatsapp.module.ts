import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WhatsAppService } from './whatsapp.service';
import { TokenManagerService } from './token-manager.service';

@Module({
  imports: [ConfigModule],
  providers: [WhatsAppService, TokenManagerService],
  exports: [WhatsAppService, TokenManagerService],
})
export class WhatsAppModule {}
