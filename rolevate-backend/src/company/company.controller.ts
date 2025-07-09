import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { CompanyService } from './company.service';
import { InvitationService } from './invitation.service';

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

  @Post(':id/invitation')
  async generateInvitation(@Param('id') companyId: string) {
    return this.invitationService.generateInvitation(companyId);
  }
}
