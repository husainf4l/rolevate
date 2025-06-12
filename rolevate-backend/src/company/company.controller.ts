import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto, UpdateCompanyDto, CompanyQueryDto } from './dto/company.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companyService.create(createCompanyDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async findAll(@Query() query: CompanyQueryDto) {
    return this.companyService.findAll(query);
  }

  @Get('my-company')
  @UseGuards(JwtAuthGuard)
  async getMyCompany(@GetUser() user: any) {
    if (!user.companyId) {
      throw new Error('User is not associated with any company');
    }
    return this.companyService.findOne(user.companyId);
  }

  @Get('my-company/stats')
  @UseGuards(JwtAuthGuard)
  async getMyCompanyStats(@GetUser() user: any) {
    if (!user.companyId) {
      throw new Error('User is not associated with any company');
    }
    return this.companyService.getCompanyStats(user.companyId, user.companyId);
  }

  @Get('my-company/users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY_ADMIN, UserRole.HR_MANAGER)
  async getMyCompanyUsers(@GetUser() user: any) {
    if (!user.companyId) {
      throw new Error('User is not associated with any company');
    }
    return this.companyService.getCompanyUsers(user.companyId, user.companyId);
  }

  @Get('my-company/job-posts')
  @UseGuards(JwtAuthGuard)
  async getMyCompanyJobPosts(@GetUser() user: any) {
    if (!user.companyId) {
      throw new Error('User is not associated with any company');
    }
    return this.companyService.getCompanyJobPosts(user.companyId, user.companyId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async findOne(@Param('id') id: string) {
    return this.companyService.findOne(id);
  }

  @Get(':id/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async getCompanyStats(@Param('id') id: string) {
    return this.companyService.getCompanyStats(id);
  }

  @Get(':id/users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async getCompanyUsers(@Param('id') id: string) {
    return this.companyService.getCompanyUsers(id);
  }

  @Get(':id/job-posts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async getCompanyJobPosts(@Param('id') id: string) {
    return this.companyService.getCompanyJobPosts(id);
  }

  @Patch('my-company')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY_ADMIN)
  async updateMyCompany(
    @Body() updateCompanyDto: UpdateCompanyDto,
    @GetUser() user: any,
  ) {
    if (!user.companyId) {
      throw new Error('User is not associated with any company');
    }
    return this.companyService.update(user.companyId, updateCompanyDto, user.companyId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ) {
    return this.companyService.update(id, updateCompanyDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return this.companyService.remove(id);
  }
}
