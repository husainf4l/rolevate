import { Controller, Get } from '@nestjs/common';
import { ConnectionDetailsService } from './connection-details.service';
import { ConnectionDetails } from './interfaces/connection-details.interface';

@Controller('connection-details')
export class ConnectionDetailsController {
  constructor(private readonly connectionDetailsService: ConnectionDetailsService) {}

  @Get()
  async getConnectionDetails(): Promise<ConnectionDetails> {
    return this.connectionDetailsService.getConnectionDetails();
  }
}
