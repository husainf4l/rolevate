import { Entity, Column, PrimaryColumn, BeforeInsert } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { createId } from '@paralleldrive/cuid2';

@Entity()
@ObjectType()
export class SecurityLog {
  @PrimaryColumn()
  @Field(() => ID)
  id: string;

  @Column()
  @Field()
  type: string; // AUTH_FAILURE, UNAUTHORIZED_ACCESS, etc.

  @Column({ nullable: true })
  @Field({ nullable: true })
  userId?: string;

  @Column()
  @Field()
  ipHash: string; // Hashed IP for privacy

  @Column({ nullable: true })
  @Field({ nullable: true })
  userAgentHash?: string; // Hashed user agent

  @Column('json')
  @Field(() => GraphQLJSONObject)
  details: Record<string, any>; // Additional event details

  @Column()
  @Field()
  severity: string; // LOW, MEDIUM, HIGH, CRITICAL

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @Field()
  createdAt: Date;

  @BeforeInsert()
  generateId() {
    this.id = createId();
  }
}