import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Interview } from '../interview/interview.entity';
import { User } from '../user/user.entity';

@Entity()
@ObjectType()
export class LiveKitRoom {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column({ unique: true })
  @Field()
  roomId: string;

  @Column()
  @Field()
  name: string;

  @Column({ nullable: true })
  interviewId?: string;

  @ManyToOne(() => Interview, { nullable: true })
  @JoinColumn({ name: 'interviewId' })
  @Field(() => Interview, { nullable: true })
  interview?: Interview;

  @Column('text', { array: true, default: [] })
  @Field(() => [String])
  participants: string[];

  @Column({ default: true })
  @Field()
  isActive: boolean;

  @Column({ type: 'int', default: 2 })
  @Field()
  maxParticipants: number;

  @Column()
  createdById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  @Field(() => User)
  createdBy: User;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}