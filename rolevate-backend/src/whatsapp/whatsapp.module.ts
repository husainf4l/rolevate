import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WhatsAppController } from './whatsapp.controller';
import { WhatsAppService } from './whatsapp.service';
import { TokenManagerService } from './token-manager.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule, ConfigModule],
    controllers: [WhatsAppController],
    providers: [WhatsAppService, TokenManagerService],
    exports: [WhatsAppService, TokenManagerService],
})
export class WhatsAppModule { }
