import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Interview } from './interview.entity';
import { CreateInterviewInput } from './create-interview.input';
import { UpdateInterviewInput } from './update-interview.input';

@Injectable()
export class InterviewService {
  constructor(
    @InjectRepository(Interview)
    private interviewRepository: Repository<Interview>,
  ) {}

  async create(createInterviewInput: CreateInterviewInput): Promise<Interview> {
    const interview = this.interviewRepository.create(createInterviewInput);
    return this.interviewRepository.save(interview);
  }

  async findAll(): Promise<Interview[]> {
    return this.interviewRepository.find({
      relations: ['application', 'interviewer', 'transcripts'],
    });
  }

  async findOne(id: string): Promise<Interview | null> {
    return this.interviewRepository.findOne({
      where: { id },
      relations: ['application', 'interviewer', 'transcripts'],
    });
  }

  async findByApplicationId(applicationId: string): Promise<Interview[]> {
    return this.interviewRepository.find({
      where: { applicationId },
      relations: ['application', 'interviewer', 'transcripts'],
    });
  }

  async findByInterviewerId(interviewerId: string): Promise<Interview[]> {
    return this.interviewRepository.find({
      where: { interviewerId },
      relations: ['application', 'interviewer', 'transcripts'],
    });
  }

  async update(id: string, updateInterviewInput: UpdateInterviewInput): Promise<Interview | null> {
    await this.interviewRepository.update(id, updateInterviewInput);
    return this.findOne(id);
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.interviewRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}