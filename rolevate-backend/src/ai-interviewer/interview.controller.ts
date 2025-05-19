import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InterviewService } from './interview.service';
import { AiBotService } from './ai-bot.service';
import { InterviewState } from './interfaces/ai-interviewer.interfaces';
import { CreateInterviewDto, ResponseDto } from './dto/interview.dto';

@Controller('interview')
export class InterviewController {
  private readonly logger = new Logger(InterviewController.name);

  constructor(
    private readonly interviewService: InterviewService,
    private readonly aiBotService: AiBotService,
  ) {}

  @Post()
  async createInterview(@Body() data: CreateInterviewDto) {
    try {
      this.logger.log(
        `Creating interview in room ${data.roomName} for candidate ${data.candidateId}`,
      );
      
      const interview = await this.interviewService.createInterview(
        data.roomName,
        data.candidateId,
        data.jobDescription,
      );
      
      // Create and connect the AI Bot to the room
      await this.aiBotService.createAiBot(data.roomName, interview.id);
      
      return {
        interviewId: interview.id,
        roomName: interview.roomName,
        state: interview.state,
      };
    } catch (error) {
      this.logger.error(`Error creating interview: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to create interview',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/start')
  startInterview(@Param('id') interviewId: string) {
    try {
      this.logger.log(`Starting interview ${interviewId}`);
      
      // Check if interviewId exists
      if (!interviewId || interviewId === 'undefined') {
        this.logger.error('Interview ID is undefined or invalid');
        throw new HttpException(
          'Valid interview ID is required',
          HttpStatus.BAD_REQUEST,
        );
      }
      
      const introduction = this.interviewService.startInterview(interviewId);
      
      return {
        interviewId,
        state: InterviewState.INTRODUCTION,
        message: introduction,
      };
    } catch (error) {
      this.logger.error(`Error starting interview: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to start interview',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/response')
  async processResponse(
    @Param('id') interviewId: string,
    @Body() data: ResponseDto,
  ) {
    try {
      this.logger.log(
        `Processing response for interview ${interviewId}: ${data.response.substring(
          0,
          50,
        )}...`,
      );
      
      const result = await this.interviewService.processResponse(
        interviewId,
        data.response,
      );
      
      const interview = this.interviewService.getInterview(interviewId);
      
      return {
        interviewId,
        state: interview.state,
        message: result.text,
        messageType: result.type,
      };
    } catch (error) {
      this.logger.error(
        `Error processing response: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        'Failed to process response',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  getInterview(@Param('id') interviewId: string) {
    try {
      this.logger.log(`Getting interview ${interviewId}`);
      const interview = this.interviewService.getInterview(interviewId);
      
      return {
        id: interview.id,
        roomName: interview.roomName,
        candidateId: interview.candidateId,
        state: interview.state,
        currentQuestionIndex: interview.currentQuestionIndex,
        startTime: interview.startTime,
        endTime: interview.endTime,
        questionCount: interview.questions.length,
      };
    } catch (error) {
      this.logger.error(`Error getting interview: ${error.message}`, error.stack);
      throw new HttpException(
        'Interview not found',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Get('room/:roomName')
  getInterviewByRoom(@Param('roomName') roomName: string) {
    try {
      this.logger.log(`Getting interview by room name: ${roomName}`);
      
      // Find interview by room name
      const interview = this.interviewService.getInterviewByRoom(roomName);
      
      if (!interview) {
        throw new HttpException(
          'Interview not found for the specified room',
          HttpStatus.NOT_FOUND,
        );
      }
      
      return {
        interviewId: interview.id,
        roomName: interview.roomName,
        state: interview.state,
      };
    } catch (error) {
      this.logger.error(`Error getting interview by room: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to get interview details',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/transcript')
  getTranscript(@Param('id') interviewId: string) {
    try {
      this.logger.log(`Getting transcript for interview ${interviewId}`);
      const transcript = this.interviewService.getTranscript(interviewId);
      return { transcript };
    } catch (error) {
      this.logger.error(
        `Error getting transcript: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        'Failed to get transcript',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/summary')
  async getSummary(@Param('id') interviewId: string) {
    try {
      this.logger.log(`Generating summary for interview ${interviewId}`);
      const summary = await this.interviewService.generateSummary(interviewId);
      return { summary };
    } catch (error) {
      this.logger.error(`Error getting summary: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to generate summary',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/end')
  endInterview(@Param('id') interviewId: string) {
    try {
      this.logger.log(`Ending interview ${interviewId}`);
      
      // Update interview state to completed
      const interview = this.interviewService.updateInterviewState(
        interviewId,
        InterviewState.COMPLETED,
      );
      
      // Disconnect the AI Bot from the room
      this.aiBotService.disconnectAiBot(interview.roomName);
      
      return {
        interviewId,
        state: interview.state,
        message: 'Interview completed successfully',
      };
    } catch (error) {
      this.logger.error(`Error ending interview: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to end interview',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
