import { Controller, Get, Param, Post, Body, UseGuards, Req, UnauthorizedException, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { CompanyService } from './company.service';
import { InvitationService } from './invitation.service';
import { CreateCompanyDto, JoinCompanyDto } from './dto/company.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { AwsS3Service } from '../services/aws-s3.service';

@Controller('company')
export class CompanyController {
  constructor(
    private readonly companyService: CompanyService,
    private readonly invitationService: InvitationService,
    private readonly awsS3Service: AwsS3Service,
  ) {}

  @Get()
  async findAll() {
    return this.companyService.findAll();
  }

  // Specific routes must come BEFORE parameterized routes
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getMyCompanyProfile(@Req() req: Request) {
    const user = req.user as any;
    return this.companyService.getUserCompany(user.userId);
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
      { code: 'RETAIL', name:  'Retail' },
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

  @Get('me/company')
  @UseGuards(JwtAuthGuard)
  async getMyCompany(@Req() req: Request) {
    const user = req.user as any;
    return this.companyService.getUserCompany(user.userId);
  }

  @Get('invitation/:code')
  async getInvitationDetails(@Param('code') code: string) {
    const invitation = await this.invitationService.getInvitationDetails(code);
    if (!invitation) {
      throw new UnauthorizedException('Invalid invitation code');
    }
    return invitation;
  }

  // Parameterized routes come LAST
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.companyService.findById(id);
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

  @Post('upload-logo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('logo', {
    fileFilter: (req, file, cb) => {
      // Accept only image files
      const allowedMimes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp'
      ];
      
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new BadRequestException('Only image files (JPEG, PNG, GIF, WebP) are allowed'), false);
      }
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
  }))
  async uploadLogo(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const user = req.user as any;
    const userCompany = await this.companyService.getUserCompany(user.userId);
    
    if (!userCompany) {
      throw new UnauthorizedException('User must belong to a company to upload logo');
    }

    try {
      // Upload to S3 instead of local storage
      const fileName = `logo_${uuidv4()}.${file.originalname.split('.').pop()}`;
      const s3Url = await this.awsS3Service.uploadFile(
        file.buffer,
        fileName,
        `logos/${userCompany.id}`
      );

      // Update company with S3 logo URL
      const updatedCompany = await this.companyService.updateLogo(userCompany.id, s3Url);

      return {
        message: 'Logo uploaded successfully',
        logoUrl: s3Url,
        logoPath: s3Url, // Keep for backward compatibility
        company: updatedCompany
      };
    } catch (error) {
      throw new BadRequestException('Failed to upload logo to S3');
    }
  }

  @Post('upload-logo-s3')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('logo', {
    fileFilter: (req, file, cb) => {
      // Accept only image files
      const allowedMimes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp'
      ];
      
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new BadRequestException('Only image files (JPEG, PNG, GIF, WebP) are allowed'), false);
      }
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
  }))
  async uploadLogoToS3(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const user = req.user as any;
    const userCompany = await this.companyService.getUserCompany(user.userId);
    
    if (!userCompany) {
      throw new UnauthorizedException('User must belong to a company to upload logo');
    }

    try {
      // Upload to S3
      const fileName = `${uuidv4()}.${file.originalname.split('.').pop()}`;
      const s3Url = await this.awsS3Service.uploadFile(
        file.buffer,
        fileName,
        `logos/${userCompany.id}`
      );

      // Update company with S3 logo URL
      const updatedCompany = await this.companyService.updateLogo(userCompany.id, s3Url);

      return {
        message: 'Logo uploaded to S3 successfully',
        logoUrl: s3Url,
        company: updatedCompany
      };
    } catch (error) {
      throw new BadRequestException('Failed to upload logo to S3');
    }
  }
}