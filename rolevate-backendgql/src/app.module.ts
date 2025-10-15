import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ThrottlerModule } from '@nestjs/throttler';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { JobModule } from './job/job.module';
import { NotificationModule } from './notification/notification.module';
import { CompanyModule } from './company/company.module';
import { CandidateModule } from './candidate/candidate.module';
import { ApplicationModule } from './application/application.module';
import { InterviewModule } from './interview/interview.module';
import { CommunicationModule } from './communication/communication.module';
import { ReportModule } from './report/report.module';
import { SecurityModule } from './security/security.module';
import { WhatsAppModule } from './whatsapp/whatsapp.module';
import { ServicesModule } from './services/services.module';
import { LiveKitModule } from './livekit/livekit.module';
import { AuditService } from './audit.service';

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
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
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
    ServicesModule,
    LiveKitModule,
  ],
  providers: [AuditService],
})
export class AppModule {}
