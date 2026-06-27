import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MessageSenderType } from '../enums/message-sender-type.enum';
import { Ticket } from './ticket.entity';

@Entity({ name: 'messages' })
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  ticketId!: string;

  @Column({ type: 'varchar', length: 64 })
  senderId!: string;

  @Column({
    type: 'enum',
    enum: MessageSenderType,
  })
  senderType!: MessageSenderType;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  attachmentUrl!: string | null;

  @Column({ type: 'boolean', default: false })
  isInternalNote!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @ManyToOne(() => Ticket, (ticket) => ticket.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ticketId' })
  ticket!: Ticket;
}