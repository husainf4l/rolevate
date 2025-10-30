import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { JobModule } from './job/job.module';
import { NotificationModule } from './notification/notification.module';
import { CompanyModule } from './company/company.module';
import { CandidateModule } from './candidate/candidate.module';
import { ApplicationModule } from './application/application.module';
import { InterviewModule } from './interview/interview.module';
import { CommunicationModule } from './communication/communication.module';
import { SecurityModule } from './security/security.module';
import { WhatsAppModule } from './whatsapp/whatsapp.module';
import { ServicesModule } from './services/services.module';
import { LiveKitModule } from './livekit/livekit.module';
import { DatabaseBackupModule } from './database-backup/database-backup.module';
import { AuditService } from './audit.service';
import { CommonModule } from './common/common.module';
import { RATE_LIMIT } from './common/constants/config.constants';
import { QueueModule } from './queue/queue.module';
import { RedisCacheModule } from './cache/redis-cache.module';
import { CacheService } from './cache/cache.service';

@Module({
  imports: [
    CommonModule, // Global module for shared services
    RedisCacheModule, // Global Redis caching
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(), // Enable cron jobs for audit log cleanup
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: RATE_LIMIT.DEFAULT.TTL,
        limit: RATE_LIMIT.DEFAULT.LIMIT,
      },
      {
        name: 'auth',
        ttl: RATE_LIMIT.AUTH.TTL,
        limit: RATE_LIMIT.AUTH.LIMIT,
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
        migrationsRun: false, // Disabled - run migrations manually via CLI
      }),
      inject: [ConfigService],
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      path: '/api/graphql',
      playground: process.env.NODE_ENV !== 'production',
      introspection: process.env.NODE_ENV !== 'production',
      context: (args: any) => {
        // Fastify provides the request directly as the first argument
        // Not as an object with {req, reply}
        let request = args;
        let reply = undefined;
        
        // If args is an object with req/reply properties, use those
        if (args && typeof args === 'object' && !args.raw) {
          request = args.req || args.request;
          reply = args.reply || args.res;
        }
        
        return {
          request,
          reply,
          req: request,
          res: reply,
        };
      },
      csrfPrevention: {
        requestHeaders: ['x-apollo-operation-name', 'apollo-require-preflight'],
      },
    }),
    UserModule,
    AuthModule,
    ServicesModule,
    DatabaseBackupModule, // Must come after AuthModule and ServicesModule
    JobModule,
    NotificationModule,
    CompanyModule,
    CandidateModule,
    ApplicationModule,
    InterviewModule,
    CommunicationModule,
    SecurityModule,
    WhatsAppModule,
    LiveKitModule,
    QueueModule,
  ],
  providers: [
    AuditService,
    CacheService,
  ],
})
export class AppModule {}

