import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  private readonly startTime: Date;

  constructor(private readonly configService: ConfigService) {
    this.startTime = new Date();
  }

  getHello(): string {
    return 'LiveKit AI Interview System API';
  }

  getHealth(): any {
    return {
      status: 'ok',
      timestamp: new Date(),
      uptime: Math.floor((Date.now() - this.startTime.getTime()) / 1000),
      version: process.env.npm_package_version || '1.0.0',
      environment: this.configService.get<string>('NODE_ENV') || 'development',
    };
  }

  getInfo(): any {
    return {
      name: 'LiveKit AI Interview System',
      description: 'Backend server for managing LiveKit rooms and AI interviewer logic',
      version: process.env.npm_package_version || '1.0.0',
      startTime: this.startTime,
      uptime: Math.floor((Date.now() - this.startTime.getTime()) / 1000),
    };
  }
}
