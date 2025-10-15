import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, BeforeInsert } from 'typeorm';
import { User } from './user.entity';
import { createId } from '@paralleldrive/cuid2';

@Entity()
export class ApiKey {
  @PrimaryColumn()
  id: string;

  @Column({ unique: true })
  key: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @BeforeInsert()
  generateId() {
    this.id = createId();
  }
}