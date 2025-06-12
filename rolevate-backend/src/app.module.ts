import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { InterviewModule } from './interview/interview.module';
import { AuthModule } from './auth/auth.module';
import { JobPostModule } from './jobpost/jobpost.module';
import { ApplicationModule } from './application/application.module';
import { CvAnalysisModule } from './cv-analysis/cv-analysis.module';
import { NotificationModule } from './notification/notification.module';
import { CompanyModule } from './company/company.module';
import { CandidateModule } from './candidate/candidate.module';
import { ApplyModule } from './apply/apply.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    InterviewModule,
    JobPostModule,
    ApplicationModule,
    CvAnalysisModule,
    NotificationModule,
    CompanyModule,
    CandidateModule,
    ApplyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Add any middleware configuration here if needed
    // For example, you can use consumer.apply(SomeMiddleware).forRoutes('*');
  }
}
