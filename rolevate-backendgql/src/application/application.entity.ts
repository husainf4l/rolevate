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

  @Column()
  jobId: string;

  @ManyToOne(() => Job)
  @JoinColumn({ name: 'jobId' })
  @Field(() => Job)
  job: Job;

  @Column()
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