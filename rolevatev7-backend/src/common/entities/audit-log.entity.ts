import { Entity, Column, PrimaryColumn, Index, BeforeInsert, CreateDateColumn } from 'typeorm';
import { createId } from '@paralleldrive/cuid2';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';

export enum AuditAction {
  // Authentication
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  LOGOUT = 'LOGOUT',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  PASSWORD_RESET_REQUEST = 'PASSWORD_RESET_REQUEST',
  PASSWORD_RESET_COMPLETE = 'PASSWORD_RESET_COMPLETE',
  
  // User Management
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED',
  
  // API Keys
  API_KEY_GENERATED = 'API_KEY_GENERATED',
  API_KEY_REVOKED = 'API_KEY_REVOKED',
  API_KEY_INVALID = 'API_KEY_INVALID',
  
  // Jobs
  JOB_CREATED = 'JOB_CREATED',
  JOB_UPDATED = 'JOB_UPDATED',
  JOB_DELETED = 'JOB_DELETED',
  JOB_PUBLISHED = 'JOB_PUBLISHED',
  
  // Applications
  APPLICATION_CREATED = 'APPLICATION_CREATED',
  APPLICATION_UPDATED = 'APPLICATION_UPDATED',
  APPLICATION_DELETED = 'APPLICATION_DELETED',
  APPLICATION_STATUS_CHANGED = 'APPLICATION_STATUS_CHANGED',
  
  // Application Notes
  APPLICATION_NOTE_CREATED = 'APPLICATION_NOTE_CREATED',
  APPLICATION_NOTE_UPDATED = 'APPLICATION_NOTE_UPDATED',
  APPLICATION_NOTE_DELETED = 'APPLICATION_NOTE_DELETED',
  
  // Notifications
  NOTIFICATION_CREATED = 'NOTIFICATION_CREATED',
  NOTIFICATION_READ = 'NOTIFICATION_READ',
  NOTIFICATION_DELETED = 'NOTIFICATION_DELETED',
  BULK_NOTIFICATION_READ = 'BULK_NOTIFICATION_READ',
  
  // Security
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  FORBIDDEN_ACCESS = 'FORBIDDEN_ACCESS',
  SECURITY_EVENT = 'SECURITY_EVENT',
  BRUTE_FORCE_ATTEMPT = 'BRUTE_FORCE_ATTEMPT',
  INVALID_TOKEN = 'INVALID_TOKEN',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  
  // System
  SYSTEM_ERROR = 'SYSTEM_ERROR',
  DATA_EXPORT = 'DATA_EXPORT',
  DATA_IMPORT = 'DATA_IMPORT',
  DATA_DELETION = 'DATA_DELETION',
  CONFIG_CHANGE = 'CONFIG_CHANGE',
}

@Entity('audit_logs')
@ObjectType()
@Index(['userId', 'createdAt'])
@Index(['action', 'createdAt'])
@Index(['createdAt'])
export class AuditLog {
  @PrimaryColumn()
  @Field(() => ID)
  id: string;

  @Column({ type: 'enum', enum: AuditAction })
  @Field()
  @Index()
  action: AuditAction;

  @Column({ nullable: true })
  @Field({ nullable: true })
  @Index()
  userId?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  userEmail?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  resourceType?: string; // 'application', 'job', 'user', etc.

  @Column({ nullable: true })
  @Field({ nullable: true })
  resourceId?: string;

  @Column({ type: 'text', nullable: true })
  @Field({ nullable: true })
  description?: string;

  @Column('json', { nullable: true })
  @Field(() => GraphQLJSONObject, { nullable: true })
  metadata?: Record<string, any>;

  @Column({ nullable: true })
  @Field({ nullable: true })
  ipAddress?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  userAgent?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  requestId?: string;

  @Column({ default: false })
  @Field()
  isSystemAction: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  @Field()
  @Index()
  createdAt: Date;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = createId();
    }
  }
}
