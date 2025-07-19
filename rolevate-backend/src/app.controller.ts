import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test-agent-client')
  getTestClient(@Res() res: Response) {
    const filePath = path.join(process.cwd(), 'test-agent-client.html');
    
    if (fs.existsSync(filePath)) {
      const htmlContent = fs.readFileSync(filePath, 'utf8');
      res.setHeader('Content-Type', 'text/html');
      res.send(htmlContent);
    } else {
      res.status(404).send('Test client not found');
    }
  }

  @Get('agent-trigger-test')
  getAgentTriggerTest(@Res() res: Response) {
    const filePath = path.join(process.cwd(), 'agent-trigger-test.html');
    
    if (fs.existsSync(filePath)) {
      const htmlContent = fs.readFileSync(filePath, 'utf8');
      res.setHeader('Content-Type', 'text/html');
      res.send(htmlContent);
    } else {
      res.status(404).send('Agent trigger test not found');
    }
  }
}
