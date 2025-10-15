import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule } from '@nestjs/config';
import { CandidateController } from './candidate.controller';
import { CandidateService } from './candidate.service';
import { CandidateProfileResolver, ApplicationResolver } from './candidate.resolver';
import { CandidateProfile } from './entities/candidate-profile.entity';
import { Application } from './entities/application.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [CandidateProfile, Application],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      poolSize: 10,
      extra: {
        max: 10,
        connectionTimeoutMillis: 5000,
      },
    }),
    TypeOrmModule.forFeature([CandidateProfile, Application]),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: { path: 'schema.gql', federation: 2 },
    }),
  ],
  controllers: [CandidateController],
  providers: [CandidateService, CandidateProfileResolver, ApplicationResolver],
})
export class CandidateModule {}
