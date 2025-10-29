import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Unique } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from '../user/user.entity';
import { Job } from './job.entity';

/**
 * SavedJob Entity
 * Represents a many-to-many relationship between users and jobs they've bookmarked/saved
 * Uses a junction table pattern for flexibility and additional metadata
 */
@Entity()
@Unique(['userId', 'jobId']) // Prevent duplicate saves
@ObjectType()
export class SavedJob {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column('uuid')
  @Field(() => ID)
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  @Field(() => User)
  user: User;

  @Column('uuid')
  @Field(() => ID)
  jobId: string;

  @ManyToOne(() => Job, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'jobId' })
  @Field(() => Job)
  job: Job;

  @CreateDateColumn()
  @Field()
  savedAt: Date;

  // Optional: Add notes or tags for saved jobs
  @Column('text', { nullable: true })
  @Field({ nullable: true })
  notes?: string;
}
