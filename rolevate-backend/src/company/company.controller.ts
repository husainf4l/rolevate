import { Controller, Get, Param, Post, Body, UseGuards, Req, UnauthorizedException, UseInterceptors, UploadedFile, BadRequestException, Put, Patch } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { CompanyService } from './company.service';
import { InvitationService } from './invitation.service';
import { CreateCompanyDto, JoinCompanyDto, UpdateCompanyDto } from './dto/company.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { v4 as uuidv4 } from 'uuid';
import { AwsS3Service } from '../services/aws-s3.service';
import * as sharp from 'sharp';

@ApiTags('companies')
@ApiBearerAuth()
@Controller('company')
export class CompanyController {
  constructor(
    private readonly companyService: CompanyService,
    private readonly invitationService: InvitationService,
    private readonly awsS3Service: AwsS3Service,
  ) { }

  @Get()
  @ApiOperation({ 
    summary: 'Get all companies',
    description: 'Retrieves a list of all companies in the system.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Companies retrieved successfully'
  })
  async findAll() {
    return this.companyService.findAll();
  }

  // Specific routes must come BEFORE parameterized routes
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get my company profile',
    description: 'Retrieves the company profile for the authenticated user.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Company profile retrieved successfully'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid JWT token'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Company not found'
  })
  async getMyCompanyProfile(@Req() req: Request) {
    const user = req.user as any;
    return this.companyService.getUserCompany(user.userId);
  }

  @Get('stats')
  @ApiOperation({ 
    summary: 'Get company statistics',
    description: 'Retrieves overall statistics about companies in the system.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Company statistics retrieved successfully'
  })
  async getCompanyStats() {
    return this.companyService.getCompanyStats();
  }

  @Get('countries')
  @ApiOperation({ 
    summary: 'Get available countries',
    description: 'Retrieves a list of available countries for company registration.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Countries retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          code: { type: 'string', example: 'AE' },
          name: { type: 'string', example: 'United Arab Emirates' }
        }
      }
    }
  })
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
  @ApiOperation({ 
    summary: 'Get available industries',
    description: 'Retrieves a list of available industries for company registration.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Industries retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          code: { type: 'string', example: 'TECHNOLOGY' },
          name: { type: 'string', example: 'Technology' }
        }
      }
    }
  })
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

  @Get('me/company')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get my company details',
    description: 'Retrieves detailed information about the authenticated user\'s company.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Company details retrieved successfully'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid JWT token'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Company not found'
  })
  async getMyCompany(@Req() req: Request) {
    const user = req.user as any;
    return this.companyService.getUserCompany(user.userId);
  }

  @Get('invitation/:code')
  @ApiOperation({ 
    summary: 'Get invitation details',
    description: 'Retrieves details about a company invitation using the invitation code.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Invitation details retrieved successfully'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Invalid invitation code'
  })
  @ApiParam({ name: 'code', description: 'Invitation code' })
  async getInvitationDetails(@Param('code') code: string) {
    const invitation = await this.invitationService.getInvitationDetails(code);
    if (!invitation) {
      throw new UnauthorizedException('Invalid invitation code');
    }
    return invitation;
  }

  // Parameterized routes come LAST
  @Get(':id')
  @ApiOperation({ 
    summary: 'Get company by ID',
    description: 'Retrieves a specific company by its ID.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Company retrieved successfully'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Company not found'
  })
  @ApiParam({ name: 'id', description: 'Company ID' })
  async findById(@Param('id') id: string) {
    return this.companyService.findById(id);
  }

  @Get(':id/invitations')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get company invitations',
    description: 'Retrieves all invitations for a specific company. Only accessible by company members.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Company invitations retrieved successfully'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid JWT token or not a company member'
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - User does not belong to this company'
  })
  @ApiParam({ name: 'id', description: 'Company ID' })
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
  @ApiOperation({ 
    summary: 'Register a new company',
    description: 'Creates a new company and associates it with the authenticated user.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Company registered successfully'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - Invalid company data'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid JWT token'
  })
  @ApiBody({ type: CreateCompanyDto })
  async registerCompany(
    @Body() createCompanyDto: CreateCompanyDto,
    @Req() req: Request,
  ) {
    const user = req.user as any;
    return this.companyService.create(createCompanyDto, user.userId);
  }

  @Post('join')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Join a company',
    description: 'Allows a user to join a company using an invitation code.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully joined company'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - Invalid invitation code'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid JWT token'
  })
  @ApiBody({ type: JoinCompanyDto })
  async joinCompany(
    @Body() joinCompanyDto: JoinCompanyDto,
    @Req() req: Request,
  ) {
    const user = req.user as any;
    return this.companyService.joinCompany(user.userId, joinCompanyDto.invitationCode);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Update company (PUT)',
    description: 'Updates a company\'s information. Only accessible by company members.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Company updated successfully'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - Invalid company data'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid JWT token'
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - User does not belong to this company'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Company not found'
  })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiBody({ type: UpdateCompanyDto })
  async updateCompany(
    @Param('id') companyId: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @Req() req: Request,
  ) {
    const user = req.user as any;
    return this.companyService.update(companyId, updateCompanyDto, user.userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Update company (PATCH)',
    description: 'Partially updates a company\'s information. Only accessible by company members.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Company updated successfully'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - Invalid company data'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid JWT token'
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - User does not belong to this company'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Company not found'
  })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiBody({ type: UpdateCompanyDto })
  async patchCompany(
    @Param('id') companyId: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @Req() req: Request,
  ) {
    const user = req.user as any;
    return this.companyService.update(companyId, updateCompanyDto, user.userId);
  }

  @Post(':id/invitation')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Generate company invitation',
    description: 'Generates a new invitation code for the company. Only accessible by company members.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Invitation generated successfully'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid JWT token'
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - User does not belong to this company'
  })
  @ApiParam({ name: 'id', description: 'Company ID' })
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
  @ApiOperation({ 
    summary: 'Upload company logo',
    description: 'Uploads a logo image for the authenticated user\'s company and stores it in S3.'
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ 
    status: 200, 
    description: 'Logo uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Logo uploaded successfully' },
        logoUrl: { type: 'string', example: 'https://s3.amazonaws.com/bucket/logos/logo.jpg' },
        logoPath: { type: 'string', example: 'https://s3.amazonaws.com/bucket/logos/logo.jpg' },
        company: { type: 'object' }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - Invalid file type, no file uploaded, or upload failed'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid JWT token or user not in company'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        logo: {
          type: 'string',
          format: 'binary',
          description: 'Logo image file (JPEG, PNG, GIF, WebP, max 5MB)'
        }
      }
    }
  })
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
      // Resize the image to 90% of original size
      const metadata = await sharp(file.buffer).metadata();
      const resizedBuffer = await sharp(file.buffer)
        .resize(Math.round(metadata.width * 0.9), Math.round(metadata.height * 0.9))
        .toBuffer();

      // Upload to S3 instead of local storage
      const fileName = `logo_${uuidv4()}.${file.originalname.split('.').pop()}`;
      const s3Url = await this.awsS3Service.uploadFile(
        resizedBuffer,
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
    } catch {
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
  @ApiOperation({ 
    summary: 'Upload company logo to S3',
    description: 'Uploads a logo image for the authenticated user\'s company to S3 storage.'
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ 
    status: 200, 
    description: 'Logo uploaded to S3 successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Logo uploaded to S3 successfully' },
        logoUrl: { type: 'string', example: 'https://s3.amazonaws.com/bucket/logos/logo.jpg' },
        company: { type: 'object' }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - Invalid file type, no file uploaded, or upload failed'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid JWT token or user not in company'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        logo: {
          type: 'string',
          format: 'binary',
          description: 'Logo image file (JPEG, PNG, GIF, WebP, max 5MB)'
        }
      }
    }
  })
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
      // Resize the image to 90% of original size
      const metadata = await sharp(file.buffer).metadata();
      const resizedBuffer = await sharp(file.buffer)
        .resize(Math.round(metadata.width * 0.9), Math.round(metadata.height * 0.9))
        .toBuffer();

      // Upload to S3
      const fileName = `${uuidv4()}.${file.originalname.split('.').pop()}`;
      const s3Url = await this.awsS3Service.uploadFile(
        resizedBuffer,
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
    } catch {
      throw new BadRequestException('Failed to upload logo to S3');
    }
  }
}