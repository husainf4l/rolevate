import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { ReportTemplate } from './report-template.entity';
import { User } from '../user/user.entity';
import { Company } from '../company/company.entity';

export enum ScheduleType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
}

registerEnumType(ScheduleType, {
  name: 'ScheduleType',
});

@Entity()
@ObjectType()
export class ReportSchedule {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  templateId: string;

  @ManyToOne(() => ReportTemplate, template => template.schedules)
  @JoinColumn({ name: 'templateId' })
  @Field(() => ReportTemplate)
  template: ReportTemplate;

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

  @Column({
    type: 'enum',
    enum: ScheduleType,
  })
  @Field(() => ScheduleType)
  scheduleType: ScheduleType;

  @Column({ type: 'json' })
  @Field(() => GraphQLJSONObject)
  scheduleConfig: any;

  @Column({ default: true })
  @Field()
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  lastRunAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  nextRunAt?: Date;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}