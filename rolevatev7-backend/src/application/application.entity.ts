import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { Job } from '../job/job.entity';
import { User } from '../user/user.entity';
import { ApplicationNote } from './application-note.entity';

export enum ApplicationStatus {
  PENDING = 'PENDING',
  REVIEWED = 'REVIEWED',
  SHORTLISTED = 'SHORTLISTED',
  INTERVIEWED = 'INTERVIEWED',
  OFFERED = 'OFFERED',
  HIRED = 'HIRED',
  ANALYZED = 'ANALYZED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}

registerEnumType(ApplicationStatus, {
  name: 'ApplicationStatus',
});

@Entity()
@ObjectType()
export class Application {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column({ type: 'uuid' })
  jobId: string;

  @ManyToOne(() => Job)
  @JoinColumn({ name: 'jobId' })
  @Field(() => Job)
  job: Job;

  @Column({ type: 'uuid' })
  candidateId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'candidateId' })
  @Field(() => User)
  candidate: User;

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.PENDING,
  })
  @Field(() => ApplicationStatus)
  status: ApplicationStatus;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @Field()
  appliedAt: Date;

  @Column('text', { nullable: true })
  @Field({ nullable: true })
  coverLetter?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  resumeUrl?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  expectedSalary?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  noticePeriod?: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  @Field({ nullable: true })
  cvAnalysisScore?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  @Field({ nullable: true })
  cvScore?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  @Field({ nullable: true })
  firstInterviewScore?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  @Field({ nullable: true })
  secondInterviewScore?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  @Field({ nullable: true })
  finalScore?: number;

  @Column({ type: 'json', nullable: true })
  @Field(() => GraphQLJSONObject, { nullable: true })
  cvAnalysisResults?: any;

  @Column({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  analyzedAt?: Date;

  @Column('text', { nullable: true })
  @Field({ nullable: true })
  aiCvRecommendations?: string;

  @Column('text', { nullable: true })
  @Field({ nullable: true })
  aiInterviewRecommendations?: string;

  @Column('text', { nullable: true })
  @Field({ nullable: true })
  aiSecondInterviewRecommendations?: string;

  @Column({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  recommendationsGeneratedAt?: Date;

  @Column('text', { nullable: true })
  @Field({ nullable: true })
  companyNotes?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  source?: string;

  @Column('text', { nullable: true })
  @Field({ nullable: true })
  notes?: string;

  @Column({ type: 'json', nullable: true })
  @Field(() => GraphQLJSONObject, { nullable: true })
  aiAnalysis?: any;

  @Column({ default: false })
  @Field()
  interviewScheduled: boolean;

  @Column({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  reviewedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  interviewScheduledAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  interviewedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  rejectedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  acceptedAt?: Date;

  @Column({ default: 'english' })
  @Field()
  interviewLanguage: string;

  @OneToMany(() => ApplicationNote, applicationNote => applicationNote.application)
  @Field(() => [ApplicationNote])
  applicationNotes: ApplicationNote[];

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}