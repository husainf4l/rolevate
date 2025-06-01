import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConnectionDetailsController } from './connection-details.controller';
import { ConnectionDetailsService } from './connection-details.service';

@Module({
  imports: [ConfigModule],
  controllers: [ConnectionDetailsController],
  providers: [ConnectionDetailsService],
  exports: [ConnectionDetailsService],
})
export class ConnectionDetailsModule {}
