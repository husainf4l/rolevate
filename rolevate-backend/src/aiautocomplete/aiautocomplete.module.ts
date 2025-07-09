import { Module } from '@nestjs/common';
import { AiautocompleteController } from './aiautocomplete.controller';
import { AiautocompleteService } from './aiautocomplete.service';

@Module({
  controllers: [AiautocompleteController],
  providers: [AiautocompleteService],
  exports: [AiautocompleteService],
})
export class AiautocompleteModule {}