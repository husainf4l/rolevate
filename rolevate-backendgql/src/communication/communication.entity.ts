import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Application } from '../application/application.entity';
import { User } from '../user/user.entity';

export enum CommunicationType {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  WHATSAPP = 'WHATSAPP',
  IN_APP = 'IN_APP',
}

registerEnumType(CommunicationType, {
  name: 'CommunicationType',
});

@Entity()
@ObjectType()
export class Communication {
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
  senderId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'senderId' })
  @Field(() => User)
  sender: User;

  @Column()
  recipientId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'recipientId' })
  @Field(() => User)
  recipient: User;

  @Column({
    type: 'enum',
    enum: CommunicationType,
  })
  @Field(() => CommunicationType)
  type: CommunicationType;

  @Column({ nullable: true })
  @Field({ nullable: true })
  subject?: string;

  @Column('text')
  @Field()
  message: string;

  @Column({ default: false })
  @Field()
  isRead: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @Field()
  sentAt: Date;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}