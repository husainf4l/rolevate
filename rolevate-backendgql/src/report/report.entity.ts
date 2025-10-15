import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { User } from '../user/user.entity';
import { Company } from '../company/company.entity';
import { ReportMetrics } from './report-metrics.entity';
import { ReportShare } from './report-share.entity';
import { ReportAuditLog } from './report-audit-log.entity';

export enum ReportType {
  APPLICATIONS = 'APPLICATIONS',
  INTERVIEWS = 'INTERVIEWS',
  HIRES = 'HIRES',
  CANDIDATE_ANALYTICS = 'CANDIDATE_ANALYTICS',
  JOB_PERFORMANCE = 'JOB_PERFORMANCE',
  COMPANY_OVERVIEW = 'COMPANY_OVERVIEW',
}

export enum ReportStatus {
  PENDING = 'PENDING',
  GENERATING = 'GENERATING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
}

registerEnumType(ReportType, {
  name: 'ReportType',
});

registerEnumType(ReportStatus, {
  name: 'ReportStatus',
});

@Entity()
@ObjectType()
export class Report {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
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

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  @Field(() => User)
  user: User;

  @Column({ nullable: true })
  companyId?: string;

  @ManyToOne(() => Company, { nullable: true })
  @JoinColumn({ name: 'companyId' })
  @Field(() => Company, { nullable: true })
  company?: Company;

  @Column({ type: 'json' })
  @Field(() => GraphQLJSONObject)
  config: any;

  @Column({ type: 'json', nullable: true })
  @Field(() => GraphQLJSONObject, { nullable: true })
  data?: any;

  @Column({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  generatedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  expiresAt?: Date;

  @Column({
    type: 'enum',
    enum: ReportStatus,
    default: ReportStatus.PENDING,
  })
  @Field(() => ReportStatus)
  status: ReportStatus;

  @OneToMany(() => ReportMetrics, reportMetrics => reportMetrics.report)
  @Field(() => [ReportMetrics])
  metrics: ReportMetrics[];

  @OneToMany(() => ReportShare, reportShare => reportShare.report)
  @Field(() => [ReportShare])
  shares: ReportShare[];

  @OneToMany(() => ReportAuditLog, reportAuditLog => reportAuditLog.report)
  @Field(() => [ReportAuditLog])
  auditLogs: ReportAuditLog[];

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}