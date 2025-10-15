import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Report } from './report.entity';

@Entity()
@ObjectType()
export class ReportMetrics {
  @PrimaryGeneratedColumn('uuid')
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

  @Column({ nullable: true })
  @Field({ nullable: true })
  metricUnit?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  period?: string;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}