import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { InvitationService } from './invitation.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [PrismaModule, UploadsModule],
  providers: [CompanyService, InvitationService],
  controllers: [CompanyController],
  exports: [CompanyService, InvitationService],
})
export class CompanyModule {}
