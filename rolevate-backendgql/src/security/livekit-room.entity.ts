import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, BeforeInsert } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { createId } from '@paralleldrive/cuid2';

@Entity()
@ObjectType()
export class LiveKitRoom {
  @PrimaryColumn()
  @Field(() => ID)
  id: string;

  @Column({ unique: true })
  @Field()
  name: string;

  @Column('json', { nullable: true })
  @Field(() => GraphQLJSONObject, { nullable: true })
  metadata?: Record<string, any>;

  @Column({ nullable: true })
  @Field({ nullable: true })
  createdBy?: string; // User ID or system

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;

  @BeforeInsert()
  generateId() {
    this.id = createId();
  }
}