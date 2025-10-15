import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, BeforeInsert, OneToMany, Index } from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { User } from '../user/user.entity';
import { Company } from '../company/company.entity';
import { createId } from '@paralleldrive/cuid2';

export enum JobType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  REMOTE = 'REMOTE',
}

export enum JobLevel {
  ENTRY = 'ENTRY',
  MID = 'MID',
  SENIOR = 'SENIOR',
  EXECUTIVE = 'EXECUTIVE',
}

export enum WorkType {
  ONSITE = 'ONSITE',
  REMOTE = 'REMOTE',
  HYBRID = 'HYBRID',
}

export enum JobStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  CLOSED = 'CLOSED',
  EXPIRED = 'EXPIRED',
  DELETED = 'DELETED',
}

registerEnumType(JobType, {
  name: 'JobType',
});

registerEnumType(JobLevel, {
  name: 'JobLevel',
});

registerEnumType(WorkType, {
  name: 'WorkType',
});

registerEnumType(JobStatus, {
  name: 'JobStatus',
});

@Entity()
@ObjectType()
export class Job {
  @PrimaryColumn()
  @Field(() => ID)
  id: string;

  @Column()
  @Field()
  title: string;

  @Column()
  @Field()
  department: string;

  @Column()
  @Field()
  location: string;

  @Column()
  @Field()
  salary: string;

  @Column({
    type: 'enum',
    enum: JobType,
  })
  @Field(() => JobType)
  type: JobType;

  @Column({ type: 'timestamp' })
  @Field()
  deadline: Date;

  @Column('text')
  @Field()
  description: string;

  @Column('text')
  @Field()
  shortDescription: string;

  @Column('text')
  @Field()
  responsibilities: string;

  @Column('text')
  @Field()
  requirements: string;

  @Column('text')
  @Field()
  benefits: string;

  @Column('text', { array: true })
  @Field(() => [String])
  skills: string[];

  @Column()
  @Field()
  experience: string;

  @Column()
  @Field()
  education: string;

  @Column({
    type: 'enum',
    enum: JobLevel,
  })
  @Field(() => JobLevel)
  jobLevel: JobLevel;

  @Column({
    type: 'enum',
    enum: WorkType,
  })
  @Field(() => WorkType)
  workType: WorkType;

  @Column()
  @Field()
  industry: string;

  @Column('text')
  @Field()
  companyDescription: string;

  @Column({
    type: 'enum',
    enum: JobStatus,
    default: JobStatus.DRAFT,
  })
  @Field(() => JobStatus)
  status: JobStatus;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'companyId' })
  @Field(() => Company)
  company: Company;

  @Column()
  companyId: string;

  // Note: Relations will be added when related entities are created
  // applications, interviews, communications

  // AI prompts for analysis (optional)
  @Column('text', { nullable: true })
  @Field({ nullable: true })
  cvAnalysisPrompt?: string;

  @Column('text', { nullable: true })
  @Field({ nullable: true })
  interviewPrompt?: string;

  @Column('text', { nullable: true })
  @Field({ nullable: true })
  aiSecondInterviewPrompt?: string;

  // Interview Settings
  @Column({ default: 'english' })
  @Field()
  interviewLanguage: string;

  // Metadata
  @Column({ default: false })
  @Field()
  featured: boolean;

  @Column({ default: 0 })
  @Field()
  applicants: number;

  @Column({ default: 0 })
  @Field()
  views: number;

  // Legacy field for backward compatibility
  @Column({ type: 'boolean', default: false })
  @Field()
  featuredJobs: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @Field()
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  @Field()
  updatedAt: Date;

  // Temporary: Keep postedBy relationship for now
  @ManyToOne(() => User)
  @JoinColumn({ name: 'postedById' })
  @Field(() => User)
  postedBy: User;

  @Column()
  postedById: string;

  @BeforeInsert()
  generateId() {
    this.id = createId();
  }
}