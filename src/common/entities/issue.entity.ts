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
import { ChannelType } from '../enums/channel-type.enum';
import { IssueStatus } from '../enums/issue-status.enum';
import { Priority } from '../enums/priority.enum';
import { SentimentLabel } from '../enums/sentiment-label.enum';
import { Business } from './business.entity';
import { Customer } from './customer.entity';
import { Ticket } from './ticket.entity';

@Entity({ name: 'issues' })
@Index('IDX_issues_business_status_priority', ['businessId', 'status', 'priority'])
export class Issue {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  businessId!: string;

  @Column({ type: 'uuid' })
  customerId!: string;

  @Column({
    type: 'enum',
    enum: ChannelType,
  })
  channelType!: ChannelType;

  @Column({ type: 'text' })
  messagePreview!: string;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  rawMessages!: Array<Record<string, unknown>>;

  @Column({ type: 'float', default: 0 })
  sentimentScore!: number;

  @Column({
    type: 'enum',
    enum: SentimentLabel,
    default: SentimentLabel.NEUTRAL,
  })
  sentimentLabel!: SentimentLabel;

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
    enum: IssueStatus,
    default: IssueStatus.NEW,
  })
  status!: IssueStatus;

  @Column({ type: 'text' })
  aiAnalysisSummary!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => Business, (business) => business.issues, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'businessId' })
  business!: Business;

  @ManyToOne(() => Customer, (customer) => customer.issues, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'customerId' })
  customer!: Customer;

  @OneToMany(() => Ticket, (ticket) => ticket.issue)
  tickets!: Ticket[];
}