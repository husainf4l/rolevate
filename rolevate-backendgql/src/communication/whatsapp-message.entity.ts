import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Communication } from './communication.entity';

export enum WhatsAppStatus {
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED',
}

registerEnumType(WhatsAppStatus, {
  name: 'WhatsAppStatus',
});

@Entity()
@ObjectType()
export class WhatsAppMessage {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column({ unique: true })
  communicationId: string;

  @OneToOne(() => Communication)
  @JoinColumn({ name: 'communicationId' })
  @Field(() => Communication)
  communication: Communication;

  @Column({ nullable: true })
  @Field({ nullable: true })
  messageId?: string;

  @Column({
    type: 'enum',
    enum: WhatsAppStatus,
    default: WhatsAppStatus.SENT,
  })
  @Field(() => WhatsAppStatus)
  status: WhatsAppStatus;

  @Column({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  deliveredAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  readAt?: Date;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}