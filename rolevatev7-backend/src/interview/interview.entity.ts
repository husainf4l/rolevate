import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { Application } from '../application/application.entity';
import { User } from '../user/user.entity';
import { Transcript } from './transcript.entity';

export enum InterviewType {
  VIDEO = 'VIDEO',
  PHONE = 'PHONE',
  IN_PERSON = 'IN_PERSON',
}

export enum InterviewStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

registerEnumType(InterviewType, {
  name: 'InterviewType',
});

registerEnumType(InterviewStatus, {
  name: 'InterviewStatus',
});

@Entity()
@ObjectType()
export class Interview {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  applicationId: string;

  @ManyToOne(() => Application)
  @JoinColumn({ name: 'applicationId' })
  @Field(() => Application)
  application: Application;

  @Column()
  interviewerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'interviewerId' })
  @Field(() => User)
  interviewer: User;

  @Column({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  scheduledAt?: Date;

  @Column({ type: 'int', nullable: true })
  @Field({ nullable: true })
  duration?: number;

  @Column({
    type: 'enum',
    enum: InterviewType,
    default: InterviewType.VIDEO,
  })
  @Field(() => InterviewType)
  type: InterviewType;

  @Column({
    type: 'enum',
    enum: InterviewStatus,
    default: InterviewStatus.SCHEDULED,
  })
  @Field(() => InterviewStatus)
  status: InterviewStatus;

  @Column('text', { nullable: true })
  @Field({ nullable: true })
  notes?: string;

  @Column('text', { nullable: true })
  @Field({ nullable: true })
  feedback?: string;

  @Column({ type: 'int', nullable: true })
  @Field({ nullable: true })
  rating?: number;

  @Column({ type: 'json', nullable: true })
  @Field(() => GraphQLJSONObject, { nullable: true })
  aiAnalysis?: any;

  @Column({ nullable: true })
  @Field({ nullable: true })
  recordingUrl?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  roomId?: string;

  @OneToMany(() => Transcript, transcript => transcript.interview)
  @Field(() => [Transcript])
  transcripts: Transcript[];

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}