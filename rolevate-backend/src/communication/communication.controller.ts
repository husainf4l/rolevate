import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { CommunicationService } from './communication.service';
import { 
  CreateCommunicationDto, 
  SendWhatsAppDto, 
  CommunicationFiltersDto 
} from './dto/communication.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('communications')
@UseGuards(JwtAuthGuard)
export class CommunicationController {
  constructor(private readonly communicationService: CommunicationService) {}

  @Get()
  async getCommunications(
    @Request() req: any,
    @Query() filters: CommunicationFiltersDto,
  ) {
    const companyId = req.user.companyId;
    if (!companyId) {
      throw new BadRequestException('User must be associated with a company');
    }

    return this.communicationService.findByCompany(companyId, filters);
  }

  @Get('stats')
  async getStats(
    @Request() req: any,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('jobId') jobId?: string,
  ) {
    const companyId = req.user.companyId;
    if (!companyId) {
      throw new BadRequestException('User must be associated with a company');
    }

    return this.communicationService.getStats(companyId, { dateFrom, dateTo, jobId });
  }

  @Get('history/:candidateId')
  async getCommunicationHistory(
    @Request() req: any,
    @Param('candidateId') candidateId: string,
    @Query('jobId') jobId?: string,
  ) {
    const companyId = req.user.companyId;
    if (!companyId) {
      throw new BadRequestException('User must be associated with a company');
    }

    return this.communicationService.getCommunicationHistory(companyId, candidateId, jobId);
  }

  @Get(':id')
  async getCommunication(
    @Request() req: any,
    @Param('id') id: string,
  ) {
    const companyId = req.user.companyId;
    if (!companyId) {
      throw new BadRequestException('User must be associated with a company');
    }

    return this.communicationService.findById(id, companyId);
  }

  @Post()
  async createCommunication(
    @Request() req: any,
    @Body() createCommunicationDto: CreateCommunicationDto,
  ) {
    const companyId = req.user.companyId;
    if (!companyId) {
      throw new BadRequestException('User must be associated with a company');
    }

    // Override companyId from JWT token
    createCommunicationDto.companyId = companyId;

    return this.communicationService.create(createCommunicationDto);
  }

  @Post('send-whatsapp')
  async sendWhatsApp(
    @Request() req: any,
    @Body() sendWhatsAppDto: SendWhatsAppDto,
  ) {
    const companyId = req.user.companyId;
    if (!companyId) {
      throw new BadRequestException('User must be associated with a company');
    }

    return this.communicationService.sendWhatsApp(companyId, sendWhatsAppDto);
  }
}
