import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AuditLog } from './audit-log.entity';
import { Channel } from './channel.entity';
import { Customer } from './customer.entity';
import { Issue } from './issue.entity';
import { Ticket } from './ticket.entity';
import { User } from './user.entity';

@Entity({ name: 'businesses' })
export class Business {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 180 })
  businessName!: string;

  @Column({ type: 'varchar', length: 150 })
  ownerName!: string;

  @Column({ type: 'varchar', length: 180, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 20 })
  phone!: string;

  @Column({ type: 'varchar', length: 100 })
  category!: string;

  @Column({ type: 'varchar', length: 255 })
  passwordHash!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  logoUrl!: string | null;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => User, (user) => user.business)
  users!: User[];

  @OneToMany(() => Channel, (channel) => channel.business)
  channels!: Channel[];

  @OneToMany(() => Customer, (customer) => customer.business)
  customers!: Customer[];

  @OneToMany(() => Issue, (issue) => issue.business)
  issues!: Issue[];

  @OneToMany(() => Ticket, (ticket) => ticket.business)
  tickets!: Ticket[];

  @OneToMany(() => AuditLog, (auditLog) => auditLog.business)
  auditLogs!: AuditLog[];
}