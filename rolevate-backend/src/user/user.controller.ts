import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CandidateService } from '../candidate/candidate.service';
import { CompanyService } from '../company/company.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly candidateService: CandidateService,
    private readonly companyService: CompanyService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Req() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getFullProfile(@Req() req) {
    const user = req.user as any;
    
    if (user.userType === 'CANDIDATE') {
      return await this.candidateService.findProfileByUserId(user.id);
    } else if (user.userType === 'COMPANY') {
      return await this.companyService.findById(user.companyId);
    } else {
      throw new Error('Unsupported user type');
    }
  }
}
