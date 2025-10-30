import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Application } from '../application/application.entity';

export enum CommunicationType {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  WHATSAPP = 'WHATSAPP',
  IN_APP = 'IN_APP',
}

export enum CommunicationDirection {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND',
}

export enum CommunicationStatus {
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED',
}

registerEnumType(CommunicationType, {
  name: 'CommunicationType',
});

registerEnumType(CommunicationDirection, {
  name: 'CommunicationDirection',
});

registerEnumType(CommunicationStatus, {
  name: 'CommunicationStatus',
});

@Entity()
@ObjectType()
export class Communication {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  candidateId?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  companyId?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  jobId?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  applicationId?: string;

  @ManyToOne(() => Application, { nullable: true })
  @JoinColumn({ name: 'applicationId' })
  @Field(() => Application, { nullable: true })
  application?: Application;

  @Column({
    type: 'enum',
    enum: CommunicationType,
  })
  @Field(() => CommunicationType)
  type: CommunicationType;

  @Column({
    type: 'enum',
    enum: CommunicationDirection,
  })
  @Field(() => CommunicationDirection)
  direction: CommunicationDirection;

  @Column('text')
  @Field()
  content: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  phoneNumber?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  whatsappId?: string;

  @Column({
    type: 'enum',
    enum: CommunicationStatus,
    default: CommunicationStatus.SENT,
  })
  @Field(() => CommunicationStatus)
  status: CommunicationStatus;

  @Column({ nullable: true })
  @Field({ nullable: true })
  templateName?: string;

  @Column('json', { nullable: true })
  @Field(() => [String], { nullable: true })
  templateParams?: string[];

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