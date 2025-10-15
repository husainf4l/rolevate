import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from './application.entity';
import { CreateApplicationInput } from './create-application.input';
import { UpdateApplicationInput } from './update-application.input';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
  ) {}

  async create(createApplicationInput: CreateApplicationInput): Promise<Application> {
    const application = this.applicationRepository.create(createApplicationInput);
    return this.applicationRepository.save(application);
  }

  async findAll(): Promise<Application[]> {
    return this.applicationRepository.find({
      relations: ['job', 'candidate', 'applicationNotes'],
    });
  }

  async findOne(id: string): Promise<Application | null> {
    return this.applicationRepository.findOne({
      where: { id },
      relations: ['job', 'candidate', 'applicationNotes'],
    });
  }

  async findByJobId(jobId: string): Promise<Application[]> {
    return this.applicationRepository.find({
      where: { jobId },
      relations: ['job', 'candidate', 'applicationNotes'],
    });
  }

  async findByCandidateId(candidateId: string): Promise<Application[]> {
    return this.applicationRepository.find({
      where: { candidateId },
      relations: ['job', 'candidate', 'applicationNotes'],
    });
  }

  async update(id: string, updateApplicationInput: UpdateApplicationInput): Promise<Application | null> {
    await this.applicationRepository.update(id, updateApplicationInput);
    return this.findOne(id);
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.applicationRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}