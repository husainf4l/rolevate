import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { InterviewService } from './interview.service';
import { CreateInterviewDto } from './dto/interview.dto';

@Controller('interview')
export class InterviewController {
  constructor(private readonly interviewService: InterviewService) {}

  /**
   * Create interview session and get LiveKit access token
   * Single endpoint that handles everything:
   * - Candidate registration
   * - Application creation
   * - Room setup with metadata
   * - Token generation
   */
  @Post('create')
  @HttpCode(HttpStatus.OK)
  async createInterview(@Body() createInterviewDto: CreateInterviewDto) {
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
}
