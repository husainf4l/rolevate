import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
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

  @Get('api/upload/:filename')
  async serveUpload(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = path.join(process.cwd(), 'uploads', 'cvs', filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).send('File not found');
    }
    res.sendFile(filePath);
  }
}
