import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { ReportService } from './report.service';
import { Report } from './report.entity';
import { CreateReportInput } from './create-report.input';
import { UpdateReportInput } from './update-report.input';

@Resolver(() => Report)
export class ReportResolver {
  constructor(private readonly reportService: ReportService) {}

  @Mutation(() => Report)
  async createReport(@Args('input') createReportInput: CreateReportInput): Promise<Report> {
    return this.reportService.create(createReportInput);
  }

  @Query(() => [Report], { name: 'reports' })
  async findAll(): Promise<Report[]> {
    return this.reportService.findAll();
  }

  @Query(() => Report, { name: 'report', nullable: true })
  async findOne(@Args('id', { type: () => ID }) id: string): Promise<Report | null> {
    return this.reportService.findOne(id);
  }

  @Query(() => [Report], { name: 'reportsByUser' })
  async findByUserId(@Args('userId', { type: () => ID }) userId: string): Promise<Report[]> {
    return this.reportService.findByUserId(userId);
  }

  @Query(() => [Report], { name: 'reportsByCompany' })
  async findByCompanyId(@Args('companyId', { type: () => ID }) companyId: string): Promise<Report[]> {
    return this.reportService.findByCompanyId(companyId);
  }

  @Mutation(() => Report, { nullable: true })
  async updateReport(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') updateReportInput: UpdateReportInput,
  ): Promise<Report | null> {
    return this.reportService.update(id, updateReportInput);
  }

  @Mutation(() => Boolean)
  async removeReport(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return this.reportService.remove(id);
  }
}