import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Patch,
  Param, 
  Body, 
  Query, 
  Req, 
  UseGuards,
  UnauthorizedException 
} from '@nestjs/common';
import { Request } from 'express';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  private async validateAdminAccess(req: Request): Promise<string> {
    const user = req.user as any;
    
    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    if (user.userType !== 'ADMIN') {
      throw new UnauthorizedException('Admin access required');
    }

    return user.userId || user.id;
  }

  // Placeholder endpoint for health check
  @Get('health')
  async healthCheck(@Req() req: Request) {
    await this.validateAdminAccess(req);
    
    return {
      status: 'ok',
      service: 'admin',
      timestamp: new Date().toISOString(),
      message: 'Admin service is running'
    };
  }

  // Company Management Endpoints
  @Get('companies')
  async getAllCompanies(
    @Req() req: Request,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
  ) {
    await this.validateAdminAccess(req);
    
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    
    return this.adminService.getAllCompanies(pageNum, limitNum, search);
  }

  // Candidate Management Endpoints
  @Get('candidates')
  async getAllCandidates(
    @Req() req: Request,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
  ) {
    await this.validateAdminAccess(req);
    
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    
    return this.adminService.getAllCandidates(pageNum, limitNum, search);
  }

  @Get('candidates/:id')
  async getCandidateDetails(
    @Req() req: Request,
    @Param('id') candidateId: string,
  ) {
    await this.validateAdminAccess(req);
    
    return this.adminService.getCandidateDetails(candidateId);
  }

  // Interview Management Endpoints
  @Get('interviews')
  async getAllInterviews(
    @Req() req: Request,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    await this.validateAdminAccess(req);
    
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    
    return this.adminService.getAllInterviews(pageNum, limitNum, search, status);
  }

  @Get('interviews/:id')
  async getInterviewDetails(
    @Req() req: Request,
    @Param('id') interviewId: string,
  ) {
    await this.validateAdminAccess(req);
    
    return this.adminService.getInterviewDetails(interviewId);
  }

  @Get('statistics/interviews')
  async getInterviewStatistics(@Req() req: Request) {
    await this.validateAdminAccess(req);
    
    return this.adminService.getInterviewStatistics();
  }

  // TODO: Add more admin endpoints
  // @Get('companies/:id')
  // @Post('companies/:id/activate')
  // @Post('companies/:id/deactivate')
  // @Get('users')
  // @Post('candidates/:id/activate')
  // @Post('candidates/:id/deactivate')
  // @Post('interviews/:id/reschedule')
  // @Post('interviews/:id/cancel')
  // @Get('statistics/dashboard')
  // @Get('statistics/users')
  // @Get('statistics/companies')
}
