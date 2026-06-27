import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Business } from './business.entity';
import { User } from './user.entity';

@Entity({ name: 'audit_logs' })
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  businessId!: string;

  @Column({ type: 'uuid', nullable: true })
  actorId!: string | null;

  @Column({ type: 'varchar', length: 160 })
  action!: string;

  @Column({ type: 'varchar', length: 120 })
  entityType!: string;

  @Column({ type: 'varchar', length: 120 })
  entityId!: string;

  @Column({ type: 'jsonb', nullable: true })
  beforeData!: Record<string, unknown> | null;

  @Column({ type: 'jsonb', nullable: true })
  afterData!: Record<string, unknown> | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @ManyToOne(() => Business, (business) => business.auditLogs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'businessId' })
  business!: Business;

  @ManyToOne(() => User, (user) => user.actions, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'actorId' })
  actor!: User | null;
}