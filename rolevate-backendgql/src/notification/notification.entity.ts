import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, BeforeInsert } from 'typeorm';
import { User } from '../user/user.entity';
import { createId } from '@paralleldrive/cuid2';

export enum NotificationType {
  JOB_APPLICATION = 'JOB_APPLICATION',
  JOB_UPDATE = 'JOB_UPDATE',
  SYSTEM = 'SYSTEM',
  MARKETING = 'MARKETING',
}

@Entity()
export class Notification {
  @PrimaryColumn()
  id: string;

  @Column()
  title: string;

  @Column('text')
  message: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.SYSTEM,
  })
  type: NotificationType;

  @Column({ default: false })
  isRead: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  readAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  // Optional metadata for different notification types
  @Column('json', { nullable: true })
  metadata?: Record<string, any>;

  @BeforeInsert()
  generateId() {
    this.id = createId();
  }
}