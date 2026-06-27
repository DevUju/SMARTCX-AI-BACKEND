import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Priority } from '../enums/priority.enum';
import { TicketStatus } from '../enums/ticket-status.enum';
import { Business } from './business.entity';
import { Customer } from './customer.entity';
import { Issue } from './issue.entity';
import { Message } from './message.entity';
import { User } from './user.entity';

@Entity({ name: 'tickets' })
@Index('UQ_tickets_ticket_number', ['ticketNumber'], { unique: true })
@Index('IDX_tickets_business_status_priority', ['businessId', 'status', 'priority'])
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  businessId!: string;

  @Column({ type: 'uuid' })
  issueId!: string;

  @Column({ type: 'uuid' })
  customerId!: string;

  @Column({ type: 'varchar', length: 40 })
  ticketNumber!: string;

  @Column({ type: 'varchar', length: 180 })
  title!: string;

  @Column({ type: 'varchar', length: 120 })
  category!: string;

  @Column({
    type: 'enum',
    enum: Priority,
    default: Priority.MEDIUM,
  })
  priority!: Priority;

  @Column({
    type: 'enum',
    enum: TicketStatus,
    default: TicketStatus.OPEN,
  })
  status!: TicketStatus;

  @Column({ type: 'uuid', nullable: true })
  assignedAgentId!: string | null;

  @Column({ type: 'text' })
  aiDraftSummary!: string;

  @Column({ type: 'text' })
  aiInsightSummary!: string;

  @Column({ type: 'text', array: true, default: () => "'{}'" })
  internalNotes!: string[];

  @Column({ type: 'timestamptz', nullable: true })
  resolvedAt!: Date | null;

  @Column({ type: 'text', nullable: true })
  resolutionSummary!: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  sentimentShiftStart!: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  sentimentShiftEnd!: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => Business, (business) => business.tickets, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'businessId' })
  business!: Business;

  @ManyToOne(() => Issue, (issue) => issue.tickets, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'issueId' })
  issue!: Issue;

  @ManyToOne(() => Customer, (customer) => customer.tickets, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'customerId' })
  customer!: Customer;

  @ManyToOne(() => User, (user) => user.assignedTickets, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'assignedAgentId' })
  assignedAgent!: User | null;

  @OneToMany(() => Message, (message) => message.ticket)
  messages!: Message[];
}