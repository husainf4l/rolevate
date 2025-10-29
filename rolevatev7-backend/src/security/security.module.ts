import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SecurityLogService } from './security-log.service';
import { SecurityLogResolver } from './security-log.resolver';
import { SecurityLog } from './security-log.entity';
import { LiveKitRoom } from './livekit-room.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SecurityLog, LiveKitRoom])],
  providers: [SecurityLogService, SecurityLogResolver],
  exports: [SecurityLogService],
})
export class SecurityModule {}