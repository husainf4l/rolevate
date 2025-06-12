import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UseGuards,
  Get,
} from '@nestjs/common';
import { InterviewService } from './interview.service';
import { CreateInterviewDto } from './dto/interview.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('interview')
export class InterviewController {
  constructor(private readonly interviewService: InterviewService) {}

  @Post('create')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN, UserRole.HR_MANAGER, UserRole.RECRUITER)
  async createInterview(
    @Body() createInterviewDto: CreateInterviewDto,
    @GetUser() user: any,
  ) {
    try {
      const { jobPostId, phoneNumber, firstName, lastName } = createInterviewDto;
      
      const result = await this.interviewService.createInterviewSession(
        jobPostId,
        phoneNumber,
        firstName,
        lastName
      );
      
      return result;
    } catch (error) {
      console.error('Failed to create interview:', error.message);
      throw new BadRequestException(error.message || 'Failed to create interview session');
    }
  }

  // Public endpoint for candidates to join interviews (no auth required)
  @Post('join')
  @HttpCode(HttpStatus.OK)
  async joinInterview(@Body() createInterviewDto: CreateInterviewDto) {
    try {
      const { jobPostId, phoneNumber, firstName, lastName } = createInterviewDto;
      
      const result = await this.interviewService.createInterviewSession(
        jobPostId,
        phoneNumber,
        firstName,
        lastName
      );
      
      return result;
    } catch (error) {
      console.error('Failed to join interview:', error.message);
      throw new BadRequestException(error.message || 'Failed to join interview session');
    }
  }

  // Example of getting interviews for authenticated users
  @Get('my-interviews')
  @UseGuards(JwtAuthGuard)
  async getMyInterviews(@GetUser() user: any) {
    // This would be implemented to return interviews for the authenticated user
    return { message: 'This would return interviews for the authenticated user', userId: user.id };
  }
}
