import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ThrottlerModule } from '@nestjs/throttler';
import { UserModule } from '../src/user/user.module';
import { AuthModule } from '../src/auth/auth.module';
import { JobModule } from '../src/job/job.module';
import { NotificationModule } from '../src/notification/notification.module';
import { CompanyModule } from '../src/company/company.module';
import { CandidateModule } from '../src/candidate/candidate.module';
import { ApplicationModule } from '../src/application/application.module';
import { InterviewModule } from '../src/interview/interview.module';
import { CommunicationModule } from '../src/communication/communication.module';
import { ReportModule } from '../src/report/report.module';
import { SecurityModule } from '../src/security/security.module';
import { WhatsAppModule } from '../src/whatsapp/whatsapp.module';
import { LiveKitModule } from '../src/livekit/livekit.module';
import { AuditService } from '../src/audit.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 10, // 10 requests per minute
      },
    ]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT') || 5432,
        username: configService.get('DATABASE_USERNAME'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        entities: [__dirname + '/../src/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/../src/migrations/*{.ts,.js}'],
        synchronize: false, // Disabled for production - use migrations instead
        migrationsRun: true, // Automatically run migrations on startup
      }),
      inject: [ConfigService],
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      playground: true,
      context: ({ req, reply }) => ({ req, reply }),
    }),
    UserModule,
    AuthModule,
    JobModule,
    NotificationModule,
    CompanyModule,
    CandidateModule,
    ApplicationModule,
    InterviewModule,
    CommunicationModule,
    ReportModule,
    SecurityModule,
    WhatsAppModule,
    LiveKitModule,
  ],
  providers: [AuditService],
})
export class TestAppModule {}
