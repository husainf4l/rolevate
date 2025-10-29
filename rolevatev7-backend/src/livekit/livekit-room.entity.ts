import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Application } from '../application/application.entity';

@Entity('livekit_rooms')
@ObjectType()
export class LiveKitRoom {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column({ unique: true })
  @Field()
  roomName: string;

  @Column()
  @Field()
  roomSid: string;

  @Column()
  roomPassword: string; // Hashed password - not exposed in GraphQL

  @Column()
  @Field()
  passwordExpiresAt: Date;

  @Column({ default: false })
  @Field()
  passwordUsed: boolean;

  @Column({ type: 'uuid' })
  applicationId: string;

  @ManyToOne(() => Application)
  @JoinColumn({ name: 'applicationId' })
  @Field(() => Application)
  application: Application;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}
