import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, BeforeInsert } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { Report } from './report.entity';
import { ReportMetricType } from './report.enums';
import { ReportTemplate } from './report-template.entity';
import { createId } from '@paralleldrive/cuid2';

@Entity()
@ObjectType()
export class ReportMetrics {
  @PrimaryColumn()
  @Field(() => ID)
  id: string;

  @Column()
  reportId: string;

  @ManyToOne(() => Report, report => report.metrics)
  @JoinColumn({ name: 'reportId' })
  @Field(() => Report)
  report: Report;

  @Column()
  @Field()
  metricName: string;

  @Column({ type: 'float' })
  @Field()
  metricValue: number;

  @Column({
    type: 'enum',
    enum: ReportMetricType,
  })
  @Field(() => ReportMetricType)
  metricType: ReportMetricType;

  @Column({ nullable: true })
  @Field({ nullable: true })
  dimension?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  period?: string;

  @Column('json', { nullable: true })
  @Field(() => GraphQLJSONObject, { nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @BeforeInsert()
  generateId() {
    this.id = createId();
  }
}