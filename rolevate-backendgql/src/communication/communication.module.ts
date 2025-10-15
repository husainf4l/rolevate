import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunicationService } from './communication.service';
import { CommunicationResolver } from './communication.resolver';
import { Communication } from './communication.entity';
import { WhatsAppMessage } from './whatsapp-message.entity';
import { WhatsAppModule } from '../whatsapp/whatsapp.module';
import { ServicesModule } from '../services/services.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Communication, WhatsAppMessage]),
    WhatsAppModule,
    ServicesModule,
  ],
  providers: [CommunicationService, CommunicationResolver],
  exports: [CommunicationService],
})
export class CommunicationModule {}