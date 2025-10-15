import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LiveKitService } from './livekit.service';
import { LiveKitController } from './livekit.controller';
import { LiveKitRoom } from './livekit-room.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([LiveKitRoom])],
  providers: [LiveKitService],
  controllers: [LiveKitController],
  exports: [LiveKitService],
})
export class LiveKitModule {}
