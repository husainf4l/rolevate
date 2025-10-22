import { Controller, Get } from '@nestjs/common';
import { CandidateService } from './candidate.service';

@Controller()
export class CandidateController {
  constructor(private readonly candidateService: CandidateService) {}

  @Get()
  getHello(): string {
    return this.candidateService.getHello();
  }
}
