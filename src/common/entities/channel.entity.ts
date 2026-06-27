import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ChannelType } from '../enums/channel-type.enum';
import { Business } from './business.entity';

@Entity({ name: 'channels' })
export class Channel {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  businessId!: string;

  @Column({
    type: 'enum',
    enum: ChannelType,
  })
  type!: ChannelType;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  credentials!: Record<string, string>;

  @Column({ type: 'boolean', default: false })
  isConnected!: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  connectedAt!: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @ManyToOne(() => Business, (business) => business.channels, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'businessId' })
  business!: Business;
}