import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CandidateModule } from '../candidate/candidate.module';
import { CompanyModule } from '../company/company.module';

@Module({
  imports: [PrismaModule, CandidateModule, CompanyModule],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
