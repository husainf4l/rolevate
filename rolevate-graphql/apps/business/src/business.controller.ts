import { Controller, Get } from '@nestjs/common';
import { BusinessService } from './business.service';

@Controller()
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Get()
  getHello(): string {
    return this.businessService.getHello();
  }
}
