import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Rolevate Interview API - Simplified and Ready!';
  }
}
