import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './report.entity';
import { CreateReportInput } from './create-report.input';
import { UpdateReportInput } from './update-report.input';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
  ) {}

  async create(createReportInput: CreateReportInput): Promise<Report> {
    const report = this.reportRepository.create(createReportInput);
    return this.reportRepository.save(report);
  }

  async findAll(): Promise<Report[]> {
    return this.reportRepository.find({
      relations: ['user', 'company', 'metrics', 'shares', 'auditLogs'],
    });
  }

  async findOne(id: string): Promise<Report | null> {
    return this.reportRepository.findOne({
      where: { id },
      relations: ['user', 'company', 'metrics', 'shares', 'auditLogs'],
    });
  }

  async findByUserId(userId: string): Promise<Report[]> {
    return this.reportRepository.find({
      where: { userId },
      relations: ['user', 'company', 'metrics', 'shares', 'auditLogs'],
    });
  }

  async findByCompanyId(companyId: string): Promise<Report[]> {
    return this.reportRepository.find({
      where: { companyId },
      relations: ['user', 'company', 'metrics', 'shares', 'auditLogs'],
    });
  }

  async update(id: string, updateReportInput: UpdateReportInput): Promise<Report | null> {
    await this.reportRepository.update(id, updateReportInput);
    return this.findOne(id);
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.reportRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}