import { Resolver, Query, Mutation, Args, ID, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CompanyService } from './company.service';
import { Company } from './company.entity';
import { CompanyDto, CompanyUserDto } from './company.dto';
import { CreateCompanyInput } from './create-company.input';
import { UpdateCompanyInput } from './update-company.input';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Resolver(() => CompanyDto)
export class CompanyResolver {
  constructor(private readonly companyService: CompanyService) {}

  @Mutation(() => CompanyDto)
  @UseGuards(JwtAuthGuard)
  async createCompany(
    @Args('input') createCompanyInput: CreateCompanyInput,
    @Context() context: any,
  ): Promise<CompanyDto> {
    const userId = context.req.user.userId;
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
}
