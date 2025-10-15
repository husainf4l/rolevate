import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Job } from './job.entity';
import { JobService } from './job.service';
import { JobResolver } from './job.resolver';
import { User } from '../user/user.entity';
import { Company } from '../company/company.entity';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { AuditService } from '../audit.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Job, User, Company]),
    AuthModule,
    UserModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'defaultSecret',
        signOptions: { expiresIn: '60m' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [JobService, JobResolver, AuditService],
  exports: [JobService],
})
export class JobModule {}