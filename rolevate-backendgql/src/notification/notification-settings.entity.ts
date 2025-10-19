import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from '../user/user.entity';

/**
 * NotificationSettings Entity
 * Stores user preferences for different types of notifications
 * One-to-one relationship with User
 */
@Entity()
@ObjectType()
export class NotificationSettings {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column('uuid', { unique: true })
  @Field(() => ID)
  userId: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  @Field(() => User)
  user: User;

  // Email Notifications
  @Column({ default: true })
  @Field()
  emailNotifications: boolean;

  @Column({ default: true })
  @Field()
  emailApplicationUpdates: boolean;

  @Column({ default: true })
  @Field()
  emailInterviewReminders: boolean;

  @Column({ default: true })
  @Field()
  emailJobRecommendations: boolean;

  @Column({ default: true })
  @Field()
  emailNewsletter: boolean;

  // SMS Notifications
  @Column({ default: false })
  @Field()
  smsNotifications: boolean;

  @Column({ default: false })
  @Field()
  smsApplicationUpdates: boolean;

  @Column({ default: false })
  @Field()
  smsInterviewReminders: boolean;

  // Push Notifications
  @Column({ default: true })
  @Field()
  pushNotifications: boolean;

  @Column({ default: true })
  @Field()
  pushApplicationUpdates: boolean;

  @Column({ default: true })
  @Field()
  pushInterviewReminders: boolean;

  @Column({ default: true })
  @Field()
  pushNewMessages: boolean;

  // Marketing Preferences
  @Column({ default: false })
  @Field()
  marketingEmails: boolean;

  @Column({ default: false })
  @Field()
  partnerOffers: boolean;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}
