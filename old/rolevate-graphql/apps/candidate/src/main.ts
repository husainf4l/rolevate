import { NestFactory } from '@nestjs/core';
import { CandidateModule } from './candidate.module';

async function bootstrap() {
  const app = await NestFactory.create(CandidateModule);
  await app.listen(process.env.port ?? 3004);
}
bootstrap();
