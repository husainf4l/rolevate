
import { Body, Controller, Post, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { CreateApplicationDto, ApplicationResponseDto } from './dto/application.dto';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('applications')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createApplication(
    @Body() createApplicationDto: CreateApplicationDto,
    @Req() req: Request & { user?: { id: string; candidateProfileId?: string } }
  ): Promise<ApplicationResponseDto> {
    // Require JWT and extract candidate profile from user
    const user = req.user;
    if (!user || !user.candidateProfileId) {
      throw new UnauthorizedException('Candidate authentication required');
    }
    return this.applicationService.createApplication(createApplicationDto, user.candidateProfileId);
  }
}
