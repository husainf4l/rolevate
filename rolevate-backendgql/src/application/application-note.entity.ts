import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Application } from './application.entity';
import { User } from '../user/user.entity';

@Entity()
@ObjectType()
export class ApplicationNote {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  applicationId: string;

  @ManyToOne(() => Application, application => application.applicationNotes)
  @JoinColumn({ name: 'applicationId' })
  @Field(() => Application)
  application: Application;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  @Field(() => User)
  user: User;

  @Column('text')
  @Field()
  note: string;

  @Column({ default: false })
  @Field()
  isPrivate: boolean;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}