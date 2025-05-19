import { Module } from '@nestjs/common';
import { LivekitService } from './livekit.service';
import { LivekitController } from './livekit.controller';
import { DebugController } from './debug.controller';

@Module({
  providers: [LivekitService],
  controllers: [LivekitController, DebugController],
  exports: [LivekitService],
})
export class LivekitModule {}
