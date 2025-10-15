import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyService } from './company.service';
import { CompanyResolver } from './company.resolver';
import { Company } from './company.entity';
import { Address } from '../address/address.entity';
import { Invitation } from './invitation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Company, Address, Invitation])],
  providers: [CompanyService, CompanyResolver],
  exports: [CompanyService],
})
export class CompanyModule {}