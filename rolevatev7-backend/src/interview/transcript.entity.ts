import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Interview } from './interview.entity';

@Entity()
@ObjectType()
export class Transcript {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  interviewId: string;

  @ManyToOne(() => Interview, interview => interview.transcripts)
  @JoinColumn({ name: 'interviewId' })
  @Field(() => Interview)
  interview: Interview;

  @Column('text')
  @Field()
  content: string;

  @Column()
  @Field()
  speaker: string;

  @Column({ type: 'timestamp' })
  @Field()
  timestamp: Date;

  @Column({ type: 'float', nullable: true })
  @Field({ nullable: true })
  confidence?: number;

  @Column({ default: 'english' })
  @Field()
  language: string;

  @Column({ type: 'int', nullable: true })
  @Field({ nullable: true })
  sequenceNumber?: number;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}