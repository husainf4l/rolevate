import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LiveKitService } from './livekit.service';
import { LiveKitInterviewService } from './livekit-interview.service';
import { LiveKitInterviewResolver } from './livekit-interview.resolver';
import { LiveKitController } from './livekit.controller';
import { LiveKitRoom } from './livekit-room.entity';
import { Application } from '../application/application.entity';
import { ConfigModule } from '@nestjs/config';
import { WhatsAppModule } from '../whatsapp/whatsapp.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([LiveKitRoom, Application]),
    WhatsAppModule,
  ],
  providers: [LiveKitService, LiveKitInterviewService, LiveKitInterviewResolver],
  controllers: [LiveKitController],
  exports: [LiveKitService, LiveKitInterviewService],
})
export class LiveKitModule {}
