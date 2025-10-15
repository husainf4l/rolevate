import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationService } from './application.service';
import { ApplicationResolver } from './application.resolver';
import { Application } from './application.entity';
import { ApplicationNote } from './application-note.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Application, ApplicationNote])],
  providers: [ApplicationService, ApplicationResolver],
  exports: [ApplicationService],
})
export class ApplicationModule {}