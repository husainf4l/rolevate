import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WhatsAppService } from './whatsapp.service';
import { WhatsAppResolver } from './whatsapp.resolver';
import { TokenManagerService } from './token-manager.service';

@Module({
  imports: [ConfigModule],
  providers: [WhatsAppService, WhatsAppResolver, TokenManagerService],
  exports: [WhatsAppService, TokenManagerService],
})
export class WhatsAppModule {}
