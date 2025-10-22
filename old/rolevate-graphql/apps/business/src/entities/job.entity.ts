import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Directive } from '@nestjs/graphql';

export enum JobType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACT = 'contract',
  INTERNSHIP = 'internship',
  FREELANCE = 'freelance',
}

export enum ExperienceLevel {
  ENTRY = 'entry',
  MID = 'mid',
  SENIOR = 'senior',
  LEAD = 'lead',
  EXECUTIVE = 'executive',
}

registerEnumType(JobType, {
  name: 'JobType',
  description: 'Type of employment',
});

registerEnumType(ExperienceLevel, {
  name: 'ExperienceLevel',
  description: 'Required experience level',
});

@Entity('jobs')
@ObjectType()
@Directive('@key(fields: "id")')
export class Job {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column({ type: 'uuid' })
  @Field(() => ID)
  @Index('IDX_JOB_COMPANY')
  companyId: string;

  @Column({ length: 255 })
  @Field()
  title: string;

  @Column({ type: 'text' })
  @Field()
  description: string;

  @Column({ type: 'text', nullable: true })
  @Field({ nullable: true })
  requirements?: string;

  @Column({ type: 'text', nullable: true })
  @Field({ nullable: true })
  responsibilities?: string;

  @Column({
    type: 'enum',
    enum: JobType,
    default: JobType.FULL_TIME,
  })
  @Field(() => JobType)
  @Index('IDX_JOB_TYPE')
  jobType: JobType;

  @Column({
    type: 'enum',
    enum: ExperienceLevel,
    default: ExperienceLevel.MID,
  })
  @Field(() => ExperienceLevel)
  @Index('IDX_JOB_EXPERIENCE')
  experienceLevel: ExperienceLevel;

  @Column({ length: 255 })
  @Field()
  location: string;

  @Column({ type: 'boolean', default: false })
  @Field()
  isRemote: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  @Field({ nullable: true })
  salaryMin?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  @Field({ nullable: true })
  salaryMax?: number;

  @Column({ length: 50, nullable: true })
  @Field({ nullable: true })
  currency?: string;

  @Column({ type: 'simple-array', nullable: true })
  @Field(() => [String], { nullable: true })
  skills?: string[];

  @Column({ type: 'simple-array', nullable: true })
  @Field(() => [String], { nullable: true })
  benefits?: string[];

  @Column({ default: true })
  @Field()
  @Index('IDX_JOB_ACTIVE')
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  expiresAt?: Date;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}
