import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SavedJob } from './saved-job.entity';
import { JobService } from '../job/job.service';

@Injectable()
export class SavedJobService {
  constructor(
    @InjectRepository(SavedJob)
    private savedJobRepository: Repository<SavedJob>,
    private jobService: JobService,
  ) {}

  /**
   * Save a job for a user
   */
  async saveJob(userId: string, jobId: string): Promise<SavedJob> {
    // Verify job exists
    const job = await this.jobService.findOne(jobId);
    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    // Check if already saved
    const existing = await this.savedJobRepository.findOne({
      where: { userId, jobId },
    });

    if (existing) {
      throw new ConflictException('Job already saved');
    }

    // Create saved job
    const savedJob = this.savedJobRepository.create({
      userId,
      jobId,
    });

    return this.savedJobRepository.save(savedJob);
  }

  /**
   * Remove a saved job
   */
  async unsaveJob(userId: string, jobId: string): Promise<boolean> {
    const result = await this.savedJobRepository.delete({
      userId,
      jobId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('Saved job not found');
    }

    return true;
  }

  /**
   * Get all saved jobs for a user
   */
  async findAllByUser(userId: string): Promise<SavedJob[]> {
    return this.savedJobRepository.find({
      where: { userId },
      relations: ['job', 'job.company'],
      order: { savedAt: 'DESC' },
    });
  }

  /**
   * Check if a job is saved by a user
   */
  async isSaved(userId: string, jobId: string): Promise<boolean> {
    const count = await this.savedJobRepository.count({
      where: { userId, jobId },
    });
    return count > 0;
  }

  /**
   * Get saved job by ID
   */
  async findOne(id: string): Promise<SavedJob | null> {
    return this.savedJobRepository.findOne({
      where: { id },
      relations: ['job', 'job.company'],
    });
  }

  /**
   * Get count of saved jobs for a user
   */
  async countByUser(userId: string): Promise<number> {
    return this.savedJobRepository.count({
      where: { userId },
    });
  }

  /**
   * Remove all saved jobs for a job (when job is deleted)
   */
  async removeAllForJob(jobId: string): Promise<void> {
    await this.savedJobRepository.delete({ jobId });
  }
}
