import { Injectable } from '@nestjs/common';

@Injectable()
export class CandidateService {
  getHello(): string {
    return 'Hello World!';
  }
}
