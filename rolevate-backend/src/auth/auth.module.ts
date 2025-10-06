import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { CompanyModule } from '../company/company.module';
import { CandidateModule } from '../candidate/candidate.module';
import { PrismaModule } from '../prisma/prisma.module';
import { SecurityModule } from '../security/security.module';
import { NotificationModule } from '../notification/notification.module';
import { UploadsModule } from '../uploads/uploads.module';
import { JwtStrategy } from './jwt.strategy';
import { TokenCleanupService } from './token-cleanup.service';

// Validate JWT secret is provided
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('JWT_SECRET environment variable is required but not provided');
}

@Module({
  imports: [
    PassportModule,
    ScheduleModule.forRoot(),
    JwtModule.register({
      secret: jwtSecret,
      signOptions: { expiresIn: '15m' },
    }),
    UserModule,
    CompanyModule,
    CandidateModule,
    PrismaModule,
    SecurityModule,
    NotificationModule,
    UploadsModule,
  ],
  providers: [AuthService, JwtStrategy, TokenCleanupService],
  controllers: [AuthController],
})
export class AuthModule {}
