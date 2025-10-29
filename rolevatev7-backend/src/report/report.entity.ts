import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, OneToOne, BeforeInsert } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { User } from '../user/user.entity';
import { Company } from '../company/company.entity';
import { ReportTemplate } from './report-template.entity';
import { ReportMetrics } from './report-metrics.entity';
import { ReportSchedule } from './report-schedule.entity';
import { ReportShare } from './report-share.entity';
import { ReportAuditLog } from './report-audit-log.entity';
import { createId } from '@paralleldrive/cuid2';
import {
  ReportType,
  ReportCategory,
  ReportFormat,
  ReportStatus,
  ReportScope,
  ReportPriority,
  ReportDataSource,
  ExecutionStatus,
} from './report.enums';

@Entity()
@ObjectType()
export class Report {
  @PrimaryColumn()
  @Field(() => ID)
  id: string;

  @Column({ length: 255 })
  @Field()
  name: string;

  @Column('text', { nullable: true })
  @Field({ nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: ReportType,
  })
  @Field(() => ReportType)
  type: ReportType;

  @Column({
    type: 'enum',
    enum: ReportCategory,
  })
  @Field(() => ReportCategory)
  category: ReportCategory;

  @Column({
    type: 'enum',
    enum: ReportFormat,
    default: 'PDF',
  })
  @Field(() => ReportFormat)
  format: ReportFormat;

  @Column({
    type: 'enum',
    enum: ReportStatus,
    default: 'DRAFT',
  })
  @Field(() => ReportStatus)
  status: ReportStatus;

  @Column({
    type: 'enum',
    enum: ReportScope,
    default: 'COMPANY',
  })
  @Field(() => ReportScope)
  scope: ReportScope;

  @Column({
    type: 'enum',
    enum: ReportPriority,
    default: 'MEDIUM',
  })
  @Field(() => ReportPriority)
  priority: ReportPriority;

  @Column('text', { nullable: true })
  @Field({ nullable: true })
  query?: string;

  @Column({
    type: 'enum',
    enum: ReportDataSource,
    default: 'MIXED',
  })
  @Field(() => ReportDataSource)
  dataSource: ReportDataSource;

  @Column('json', { nullable: true })
  @Field(() => GraphQLJSONObject, { nullable: true })
  filters?: Record<string, any>;

  @Column('json', { nullable: true })
  @Field(() => GraphQLJSONObject, { nullable: true })
  parameters?: Record<string, any>;

  @Column('json', { nullable: true })
  @Field(() => GraphQLJSONObject, { nullable: true })
  config?: Record<string, any>;

  @Column({
    type: 'enum',
    enum: ExecutionStatus,
    default: ExecutionStatus.PENDING,
  })
  @Field(() => ExecutionStatus)
  executionStatus: ExecutionStatus;

  @Column({ nullable: true })
  @Field({ nullable: true })
  maxExecutionTime?: number;

  @Column({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  timeoutAt?: Date;

  @Column('json', { nullable: true })
  @Field(() => GraphQLJSONObject, { nullable: true })
  data?: Record<string, any>;

  @Column({ nullable: true })
  @Field({ nullable: true })
  fileUrl?: string;

  @Column({ length: 255, nullable: true })
  @Field({ nullable: true })
  fileName?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  fileSize?: number;

  @Column({ length: 100, nullable: true })
  @Field({ nullable: true })
  fileMimeType?: string;

  @OneToMany(() => ReportMetrics, metrics => metrics.report)
  @Field(() => [ReportMetrics])
  metrics: ReportMetrics[];

  @Column({ nullable: true })
  templateId?: string;

  @ManyToOne(() => ReportTemplate, { nullable: true })
  @JoinColumn({ name: 'templateId' })
  @Field(() => ReportTemplate, { nullable: true })
  template?: ReportTemplate;

  @Column({ nullable: true })
  companyId?: string;

  @ManyToOne(() => Company, { nullable: true })
  @JoinColumn({ name: 'companyId' })
  @Field(() => Company, { nullable: true })
  company?: Company;

  @Column({ nullable: true })
  userId?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  @Field(() => User, { nullable: true })
  user?: User;

  @OneToOne(() => ReportSchedule, schedule => schedule.report)
  @Field(() => ReportSchedule, { nullable: true })
  schedule?: ReportSchedule;

  @OneToMany(() => ReportShare, shares => shares.report)
  @Field(() => [ReportShare])
  shares: ReportShare[];

  @OneToMany(() => ReportAuditLog, auditLogs => auditLogs.report)
  @Field(() => [ReportAuditLog])
  auditLogs: ReportAuditLog[];

  @Column({ nullable: true })
  @Field({ nullable: true })
  generatedBy?: string;

  @Column({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  generatedAt?: Date;

  @Column({ nullable: true })
  @Field({ nullable: true })
  executionTime?: number;

  @Column({ nullable: true })
  @Field({ nullable: true })
  recordCount?: number;

  @Column({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  expiresAt?: Date;

  @Column({ default: false })
  @Field()
  autoDelete: boolean;

  @Column({ default: false })
  @Field()
  isPublic: boolean;

  @Column({ default: false })
  @Field()
  isArchived: boolean;

  @Column({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  archivedAt?: Date;

  @Column('text', { array: true, default: [] })
  @Field(() => [String])
  tags: string[];

  @Column({ length: 10, default: '1.0' })
  @Field()
  version: string;

  @Column({ length: 64, nullable: true })
  @Field({ nullable: true })
  checksum?: string;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;

  @BeforeInsert()
  generateId() {
    this.id = createId();
  }
}