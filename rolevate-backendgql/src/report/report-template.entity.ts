import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { ReportType } from './report.entity';
import { User } from '../user/user.entity';
import { Company } from '../company/company.entity';
import { ReportSchedule } from './report-schedule.entity';

@Entity()
@ObjectType()
export class ReportTemplate {
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

  @Column({ default: false })
  @Field()
  isPublic: boolean;

  @OneToMany(() => ReportSchedule, reportSchedule => reportSchedule.template)
  @Field(() => [ReportSchedule])
  schedules: ReportSchedule[];

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}