import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { User } from '../user/user.entity';

export enum SecurityAction {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  PROFILE_UPDATE = 'PROFILE_UPDATE',
  PERMISSION_CHANGE = 'PERMISSION_CHANGE',
  DATA_ACCESS = 'DATA_ACCESS',
  DATA_MODIFICATION = 'DATA_MODIFICATION',
  SECURITY_BREACH = 'SECURITY_BREACH',
}

registerEnumType(SecurityAction, {
  name: 'SecurityAction',
});

@Entity()
@ObjectType()
export class SecurityLog {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column({ nullable: true })
  userId?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  @Field(() => User, { nullable: true })
  user?: User;

  @Column({
    type: 'enum',
    enum: SecurityAction,
  })
  @Field(() => SecurityAction)
  action: SecurityAction;

  @Column()
  @Field()
  resource: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  resourceId?: string;

  @Column('text', { nullable: true })
  @Field({ nullable: true })
  details?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  ipAddress?: string;

  @Column('text', { nullable: true })
  @Field({ nullable: true })
  userAgent?: string;

  @Column({ default: true })
  @Field()
  success: boolean;

  @CreateDateColumn()
  @Field()
  createdAt: Date;
}