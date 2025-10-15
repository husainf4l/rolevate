import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@Entity()
@ObjectType()
export class LiveKitRoom {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column({ unique: true })
  @Field()
  name: string;

  @Column({ type: 'json', nullable: true })
  @Field(() => String, { nullable: true })
  metadata?: Record<string, any>;

  @Column({ nullable: true })
  @Field({ nullable: true })
  createdBy?: string;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}
