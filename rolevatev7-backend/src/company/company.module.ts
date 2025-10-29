import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyService } from './company.service';
import { CompanyResolver } from './company.resolver';
import { Company } from './company.entity';
import { Address } from '../address/address.entity';
import { User } from '../user/user.entity';
import { Invitation } from './invitation.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Company, Address, User, Invitation]),
    AuthModule,
  ],
  providers: [CompanyService, CompanyResolver],
  exports: [CompanyService],
})
export class CompanyModule {}