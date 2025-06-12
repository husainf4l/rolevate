import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth() {
    return { 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      service: 'rolevate-interview-api'
    };
  }

  @Get('info')
  getInfo() {
    return {
      name: 'Rolevate Interview API',
      version: '1.0.0',
      description: 'Simplified interview management system',
      endpoints: {
        'POST /api/interview/create': 'Create interview session and get LiveKit token'
      },
      testPage: '/public/interview-test.html'
    };
  }
}
