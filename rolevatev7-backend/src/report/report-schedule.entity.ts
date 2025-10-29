import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, ManyToOne, BeforeInsert } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { Report } from './report.entity';
import { User } from '../user/user.entity';
import { ReportFrequency, ReportFormat } from './report.enums';
import { createId } from '@paralleldrive/cuid2';

@Entity()
@ObjectType()
export class ReportSchedule {
  @PrimaryColumn()
  @Field(() => ID)
  id: string;

  @Column()
  reportId: string;

  @OneToOne(() => Report, report => report.schedule)
  @JoinColumn({ name: 'reportId' })
  @Field(() => Report)
  report: Report;

  @Column({
    type: 'enum',
    enum: ReportFrequency,
  })
  @Field(() => ReportFrequency)
  frequency: ReportFrequency;

  @Column({ length: 100, nullable: true })
  @Field({ nullable: true })
  cronExpression?: string;

  @Column({ type: 'timestamp' })
  @Field()
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  endDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  nextRun?: Date;

  @Column({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  lastRun?: Date;

  @Column({ default: true })
  @Field()
  isActive: boolean;

  @Column({ default: false })
  @Field()
  isPaused: boolean;

  @Column({ length: 50, default: 'UTC' })
  @Field()
  timezone: string;

  @Column('text', { array: true, default: [] })
  @Field(() => [String])
  recipients: string[];

  @Column({
    type: 'enum',
    enum: ReportFormat,
    default: 'PDF',
  })
  @Field(() => ReportFormat)
  deliveryFormat: ReportFormat;

  @Column({ length: 255, nullable: true })
  @Field({ nullable: true })
  emailSubject?: string;

  @Column('text', { nullable: true })
  @Field({ nullable: true })
  emailBody?: string;

  @Column({ default: true })
  @Field()
  includeAttachment: boolean;

  @Column({ nullable: true })
  @Field({ nullable: true })
  maxExecutionTime?: number;

  @Column({ default: 0 })
  @Field()
  retryCount: number;

  @Column({ default: 3 })
  @Field()
  maxRetries: number;

  @Column({ default: 0 })
  @Field()
  consecutiveFailures: number;

  @Column('text', { nullable: true })
  @Field({ nullable: true })
  lastError?: string;

  @Column({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  lastSuccessfulRun?: Date;

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