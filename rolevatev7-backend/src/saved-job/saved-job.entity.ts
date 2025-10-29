import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from '../user/user.entity';
import { Job } from '../job/job.entity';

@Entity()
@ObjectType()
@Index(['userId', 'jobId'], { unique: true }) // Prevent duplicate saves
export class SavedJob {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column({ type: 'uuid' })
  @Field(() => ID)
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  @Field(() => User)
  user: User;

  @Column({ type: 'uuid' })
  @Field(() => ID)
  jobId: string;

  @ManyToOne(() => Job, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'jobId' })
  @Field(() => Job)
  job: Job;

  @CreateDateColumn()
  @Field()
  savedAt: Date;
}
