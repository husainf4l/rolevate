import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, BeforeInsert } from 'typeorm';
import { User } from '../user/user.entity';
import { createId } from '@paralleldrive/cuid2';

export enum NotificationType {
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  INFO = 'INFO',
  ERROR = 'ERROR',
}

export enum NotificationCategory {
  APPLICATION = 'APPLICATION',
  INTERVIEW = 'INTERVIEW',
  SYSTEM = 'SYSTEM',
  CANDIDATE = 'CANDIDATE',
  OFFER = 'OFFER',
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
    default: NotificationType.INFO,
  })
  type: NotificationType;

  @Column({
    type: 'enum',
    enum: NotificationCategory,
  })
  category: NotificationCategory;

  @Column({ default: false })
  read: boolean;

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