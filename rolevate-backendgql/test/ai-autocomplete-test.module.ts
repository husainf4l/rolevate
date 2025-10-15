import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { AiautocompleteService } from '../src/services/aiautocomplete.service';
import { AiautocompleteResolver } from '../src/services/aiautocomplete.resolver';
import { Job } from '../src/job/job.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
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
        synchronize: false,
        migrationsRun: true,
      }),
      inject: [ConfigService],
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      playground: true,
      context: ({ req, reply }) => ({ req, reply }),
    }),
    TypeOrmModule.forFeature([Job])
  ],
  providers: [AiautocompleteService, AiautocompleteResolver],
})
export class AIAutocompleteTestModule {}
