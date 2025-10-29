import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@Entity('password_reset')
@ObjectType()
export class PasswordReset {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  @Field()
  email: string;

  @Column()
  token: string;

  @Column()
  @Field()
  expiresAt: Date;

  @Column({ default: false })
  @Field()
  used: boolean;

  @CreateDateColumn()
  @Field()
  createdAt: Date;
}
