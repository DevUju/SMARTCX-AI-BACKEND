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
import { CustomerStatus } from '../enums/customer-status.enum';
import { Business } from './business.entity';
import { Issue } from './issue.entity';
import { Ticket } from './ticket.entity';

const decimalToNumberTransformer = {
  to: (value: number): string => value.toString(),
  from: (value: string): number => Number(value),
};

@Entity({ name: 'customers' })
@Index('IDX_customers_business_email', ['businessId', 'email'])
@Index('IDX_customers_business_phone', ['businessId', 'phone'])
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  businessId!: string;

  @Column({ type: 'varchar', length: 160 })
  name!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone!: string | null;

  @Column({ type: 'varchar', length: 180, nullable: true })
  email!: string | null;

  @Column({
    type: 'enum',
    enum: ChannelType,
  })
  channel!: ChannelType;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: decimalToNumberTransformer,
  })
  totalSpent!: number;

  @Column({ type: 'varchar', length: 120, nullable: true })
  location!: string | null;

  @Column({
    type: 'enum',
    enum: CustomerStatus,
    default: CustomerStatus.NEW,
  })
  status!: CustomerStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => Business, (business) => business.customers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'businessId' })
  business!: Business;

  @OneToMany(() => Issue, (issue) => issue.customer)
  issues!: Issue[];

  @OneToMany(() => Ticket, (ticket) => ticket.customer)
  tickets!: Ticket[];
}