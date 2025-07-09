import { Controller, Get, Param, Post, Body, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { CompanyService } from './company.service';
import { InvitationService } from './invitation.service';
import { CreateCompanyDto, JoinCompanyDto } from './dto/company.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('company')
export class CompanyController {
  constructor(
    private readonly companyService: CompanyService,
    private readonly invitationService: InvitationService,
  ) {}

  @Get()
  async findAll() {
    return this.companyService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.companyService.findById(id);
  }

  @Post('register')
  @UseGuards(JwtAuthGuard)
  async registerCompany(
    @Body() createCompanyDto: CreateCompanyDto,
    @Req() req: Request,
  ) {
    const user = req.user as any;
    return this.companyService.create(createCompanyDto, user.userId);
  }

  @Post('join')
  @UseGuards(JwtAuthGuard)
  async joinCompany(
    @Body() joinCompanyDto: JoinCompanyDto,
    @Req() req: Request,
  ) {
    const user = req.user as any;
    return this.companyService.joinCompany(user.userId, joinCompanyDto.invitationCode);
  }

  @Get('me/company')
  @UseGuards(JwtAuthGuard)
  async getMyCompany(@Req() req: Request) {
    const user = req.user as any;
    return this.companyService.getUserCompany(user.userId);
  }

  @Post(':id/invitation')
  @UseGuards(JwtAuthGuard)
  async generateInvitation(
    @Param('id') companyId: string,
    @Req() req: Request,
  ) {
    const user = req.user as any;
    
    // Check if user belongs to this company
    const userCompany = await this.companyService.getUserCompany(user.userId);
    if (!userCompany || userCompany.id !== companyId) {
      throw new UnauthorizedException('You can only generate invitations for your own company');
    }
    
    return this.invitationService.generateInvitation(companyId);
  }

  @Get(':id/invitations')
  @UseGuards(JwtAuthGuard)
  async getCompanyInvitations(
    @Param('id') companyId: string,
    @Req() req: Request,
  ) {
    const user = req.user as any;
    
    // Check if user belongs to this company
    const userCompany = await this.companyService.getUserCompany(user.userId);
    if (!userCompany || userCompany.id !== companyId) {
      throw new UnauthorizedException('You can only view invitations for your own company');
    }
    
    const company = await this.companyService.findById(companyId);
    return company?.invitations || [];
  }

  @Get('invitation/:code')
  async getInvitationDetails(@Param('code') code: string) {
    const invitation = await this.invitationService.getInvitationDetails(code);
    if (!invitation) {
      throw new UnauthorizedException('Invalid invitation code');
    }
    return invitation;
  }

  @Get('stats')
  async getCompanyStats() {
    return this.companyService.getCompanyStats();
  }

  @Get('countries')
  async getCountries() {
    return [
      { code: 'AE', name: 'United Arab Emirates' },
      { code: 'SA', name: 'Saudi Arabia' },
      { code: 'QA', name: 'Qatar' },
      { code: 'KW', name: 'Kuwait' },
      { code: 'BH', name: 'Bahrain' },
      { code: 'OM', name: 'Oman' },
      { code: 'EG', name: 'Egypt' },
      { code: 'JO', name: 'Jordan' },
      { code: 'LB', name: 'Lebanon' },
      { code: 'SY', name: 'Syria' },
      { code: 'IQ', name: 'Iraq' },
      { code: 'YE', name: 'Yemen' },
      { code: 'MA', name: 'Morocco' },
      { code: 'TN', name: 'Tunisia' },
      { code: 'DZ', name: 'Algeria' },
      { code: 'LY', name: 'Libya' },
      { code: 'SD', name: 'Sudan' },
      { code: 'SO', name: 'Somalia' },
      { code: 'DJ', name: 'Djibouti' },
      { code: 'KM', name: 'Comoros' },
    ];
  }

  @Get('industries')
  async getIndustries() {
    return [
      { code: 'TECHNOLOGY', name: 'Technology' },
      { code: 'HEALTHCARE', name: 'Healthcare' },
      { code: 'FINANCE', name: 'Finance' },
      { code: 'EDUCATION', name: 'Education' },
      { code: 'MANUFACTURING', name: 'Manufacturing' },
      { code: 'RETAIL', name: 'Retail' },
      { code: 'CONSTRUCTION', name: 'Construction' },
      { code: 'TRANSPORTATION', name: 'Transportation' },
      { code: 'HOSPITALITY', name: 'Hospitality' },
      { code: 'CONSULTING', name: 'Consulting' },
      { code: 'MARKETING', name: 'Marketing' },
      { code: 'REAL_ESTATE', name: 'Real Estate' },
      { code: 'MEDIA', name: 'Media' },
      { code: 'AGRICULTURE', name: 'Agriculture' },
      { code: 'ENERGY', name: 'Energy' },
      { code: 'GOVERNMENT', name: 'Government' },
      { code: 'NON_PROFIT', name: 'Non-Profit' },
      { code: 'OTHER', name: 'Other' },
    ];
  }
}
