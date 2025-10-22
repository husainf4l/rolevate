import { Module } from '@nestjs/common';
import { LiveKitService } from './livekit.service';
import { LiveKitController } from './livekit.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [LiveKitService],
  controllers: [LiveKitController],
  exports: [LiveKitService],
})
export class LiveKitModule {}
