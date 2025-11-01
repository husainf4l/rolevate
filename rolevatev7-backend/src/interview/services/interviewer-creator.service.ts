import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserType } from '../../user/user.entity';

/**
 * Service responsible for creating AI interviewer users
 * Single Responsibility: AI interviewer creation logic
 */
@Injectable()
export class InterviewerCreatorService {
  private readonly logger = new Logger(InterviewerCreatorService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Ensures an interviewer exists, creates AI interviewer if not found
   */
  async ensureInterviewerExists(interviewerId: string): Promise<void> {
    const existingInterviewer = await this.userRepository.findOne({
      where: { id: interviewerId },
    });

    if (!existingInterviewer) {
      await this.createAIInterviewer(interviewerId);
    }
  }

  /**
   * Creates an AI interviewer user with the given ID
   */
  private async createAIInterviewer(interviewerId: string): Promise<User> {
    this.logger.log(`Creating AI interviewer with ID: ${interviewerId}`);

    try {
      const aiInterviewer = this.userRepository.create({
        id: interviewerId,
        userType: UserType.SYSTEM,
        name: 'AI Interviewer',
        email: `ai-interviewer@rolevate.ai`,
        isActive: true,
      });

      const saved = await this.userRepository.save(aiInterviewer);
      this.logger.log(`AI interviewer created: ${saved.name} (${saved.id})`);

      return saved;
    } catch (error: any) {
      // If user already exists with this ID, that's fine for system users
      if (error?.code === '23505') { // Unique constraint violation
        this.logger.log(`AI interviewer with ID ${interviewerId} already exists`);
        const existingUser = await this.userRepository.findOne({ where: { id: interviewerId } });
        if (existingUser) {
          return existingUser;
        }
      }
      throw error;
    }
  }
}
