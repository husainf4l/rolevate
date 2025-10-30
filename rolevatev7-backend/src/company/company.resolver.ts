import { Resolver, Query, Mutation, Args, ID, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CompanyService } from './company.service';
import { Company } from './company.entity';
import { CompanyDto } from './company.dto';
import { CreateCompanyInput } from './create-company.input';
import { UpdateCompanyInput } from './update-company.input';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserType } from '../user/user.entity';
import { InvitationDto, CreateInvitationInput } from './invitation.dto';
import { Invitation } from './invitation.entity';

@Resolver(() => CompanyDto)
export class CompanyResolver {
  constructor(private readonly companyService: CompanyService) {}

  @Mutation(() => CompanyDto)
  @UseGuards(JwtAuthGuard)
  async createCompany(
    @Args('input') createCompanyInput: CreateCompanyInput,
    @Context() context: any,
  ): Promise<CompanyDto> {
    const userId = context.request.user.id;
    const company = await this.companyService.create(createCompanyInput, userId);
    return this.mapToDto(company);
  }

  @Query(() => [CompanyDto], { name: 'companies' })
  async findAll(): Promise<CompanyDto[]> {
    const companies = await this.companyService.findAll();
    return companies.map(company => this.mapToDto(company));
  }

  @Query(() => CompanyDto, { name: 'company', nullable: true })
  async findOne(@Args('id', { type: () => ID }) id: string): Promise<CompanyDto | null> {
    const company = await this.companyService.findOne(id);
    return company ? this.mapToDto(company) : null;
  }

  @Mutation(() => CompanyDto, { nullable: true })
  async updateCompany(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') updateCompanyInput: UpdateCompanyInput,
  ): Promise<CompanyDto | null> {
    const company = await this.companyService.update(id, updateCompanyInput);
    return company ? this.mapToDto(company) : null;
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN, UserType.SYSTEM)
  async removeCompany(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return this.companyService.remove(id);
  }

  @Query(() => [CompanyDto], { name: 'companiesByUser' })
  async findByUserId(@Args('userId', { type: () => ID }) userId: string): Promise<CompanyDto[]> {
    const companies = await this.companyService.findByUserId(userId);
    return companies.map(company => this.mapToDto(company));
  }

  private mapToDto(company: Company): CompanyDto {
    return {
      id: company.id,
      name: company.name,
      description: company.description,
      website: company.website,
      email: company.email,
      phone: company.phone,
      logo: company.logo,
      industry: company.industry,
      size: company.size,
      founded: company.founded,
      location: company.location,
      addressId: company.addressId,
      users: company.users?.map(user => ({
        id: user.id,
        userType: user.userType,
        email: user.email,
        name: user.name,
        phone: user.phone,
        avatar: user.avatar,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    };
  }

  // ==================== INVITATION MUTATIONS ====================

  @Mutation(() => InvitationDto, {
    description: 'Create an invitation link for a user to join your company',
  })
  @UseGuards(JwtAuthGuard)
  async createCompanyInvitation(
    @Args('input') input: CreateInvitationInput,
    @Context() context: any,
  ): Promise<InvitationDto> {
    const userId = context.request.user.id;
    const userCompanyId = context.request.user.companyId;
    
    if (!userCompanyId) {
      throw new Error('You must be associated with a company to create invitations');
    }
    
    const invitation = await this.companyService.createInvitation(userCompanyId, userId, input);
    return this.mapInvitationToDto(invitation);
  }

  @Query(() => InvitationDto, {
    description: 'Get invitation details by code',
    nullable: true,
  })
  async getInvitation(
    @Args('code') code: string,
  ): Promise<InvitationDto | null> {
    const invitation = await this.companyService.getInvitationByCode(code);
    return invitation ? this.mapInvitationToDto(invitation) : null;
  }

  @Mutation(() => Boolean, {
    description: 'Validate invitation code (check if it exists, not expired, not used)',
  })
  async validateInvitationCode(
    @Args('code') code: string,
  ): Promise<boolean> {
    const result = await this.companyService.validateInvitation(code);
    return result.valid;
  }

  @Mutation(() => InvitationDto, {
    description: 'Accept an invitation and join the company',
  })
  @UseGuards(JwtAuthGuard)
  async acceptCompanyInvitation(
    @Args('code') code: string,
    @Context() context: any,
  ): Promise<InvitationDto> {
    const userId = context.request.user.id;
    const invitation = await this.companyService.acceptInvitation(code, userId);
    return this.mapInvitationToDto(invitation);
  }

  @Query(() => [InvitationDto], {
    description: 'List all invitations for your company',
  })
  @UseGuards(JwtAuthGuard)
  async listCompanyInvitations(
    @Context() context: any,
  ): Promise<InvitationDto[]> {
    const userCompanyId = context.request.user.companyId;
    
    if (!userCompanyId) {
      throw new Error('You must be associated with a company to view invitations');
    }
    
    const invitations = await this.companyService.listCompanyInvitations(userCompanyId);
    return invitations.map(inv => this.mapInvitationToDto(inv));
  }

  @Mutation(() => InvitationDto, {
    description: 'Cancel an invitation',
  })
  @UseGuards(JwtAuthGuard)
  async cancelInvitation(
    @Args('invitationId', { type: () => ID }) invitationId: string,
    @Context() context: any,
  ): Promise<InvitationDto> {
    const userId = context.request.user.id;
    const invitation = await this.companyService.cancelInvitation(invitationId, userId);
    return this.mapInvitationToDto(invitation);
  }

  private mapInvitationToDto(invitation: Invitation): InvitationDto {
    // Generate the full invitation link
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const invitationLink = `${baseUrl}/invitation/${invitation.code}`;

    return {
      id: invitation.id,
      code: invitation.code,
      email: invitation.email,
      userType: invitation.userType,
      status: invitation.status,
      invitedById: invitation.invitedById,
      companyId: invitation.companyId,
      expiresAt: invitation.expiresAt,
      usedAt: invitation.usedAt,
      createdAt: invitation.createdAt,
      invitationLink,
    };
  }
}

