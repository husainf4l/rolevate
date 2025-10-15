import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Directive } from '@nestjs/graphql';

export enum ApplicationStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  SHORTLISTED = 'shortlisted',
  INTERVIEW = 'interview',
  OFFERED = 'offered',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
}

registerEnumType(ApplicationStatus, {
  name: 'ApplicationStatus',
  description: 'Status of job application',
});

@Entity('applications')
@ObjectType()
@Directive('@key(fields: "id")')
export class Application {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column({ type: 'uuid' })
  @Field(() => ID)
  @Index('IDX_APP_CANDIDATE')
  candidateId: string;

  @Column({ type: 'uuid' })
  @Field(() => ID)
  @Index('IDX_APP_JOB')
  jobId: string;

  @Column({ type: 'text', nullable: true })
  @Field({ nullable: true })
  coverLetter?: string;

  @Column({ type: 'text', nullable: true })
  @Field({ nullable: true })
  resume?: string; // URL to resume file

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.PENDING,
  })
  @Field(() => ApplicationStatus)
  @Index('IDX_APP_STATUS')
  status: ApplicationStatus;

  @Column({ type: 'text', nullable: true })
  @Field({ nullable: true })
  notes?: string; // Internal notes from recruiter

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}
