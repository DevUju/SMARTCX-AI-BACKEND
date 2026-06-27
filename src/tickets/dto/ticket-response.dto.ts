import { ApiProperty } from '@nestjs/swagger';
import { MessageSenderType } from 'src/common/enums/message-sender-type.enum';
import { Priority } from 'src/common/enums/priority.enum';
import { TicketStatus } from 'src/common/enums/ticket-status.enum';

export class TicketMessageResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  ticketId!: string;

  @ApiProperty()
  senderId!: string;

  @ApiProperty({ enum: MessageSenderType })
  senderType!: MessageSenderType;

  @ApiProperty()
  content!: string;

  @ApiProperty({ nullable: true })
  attachmentUrl!: string | null;

  @ApiProperty()
  isInternalNote!: boolean;

  @ApiProperty()
  createdAt!: Date;
}

export class TicketResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  businessId!: string;

  @ApiProperty()
  issueId!: string;

  @ApiProperty()
  customerId!: string;

  @ApiProperty()
  ticketNumber!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  category!: string;

  @ApiProperty({ enum: Priority })
  priority!: Priority;

  @ApiProperty({ enum: TicketStatus })
  status!: TicketStatus;

  @ApiProperty({ nullable: true })
  assignedAgentId!: string | null;

  @ApiProperty()
  aiDraftSummary!: string;

  @ApiProperty()
  aiInsightSummary!: string;

  @ApiProperty({ type: [String] })
  internalNotes!: string[];

  @ApiProperty({ nullable: true })
  resolvedAt!: Date | null;

  @ApiProperty({ nullable: true })
  resolutionSummary!: string | null;

  @ApiProperty({ nullable: true })
  sentimentShiftStart!: string | null;

  @ApiProperty({ nullable: true })
  sentimentShiftEnd!: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiProperty({ type: [TicketMessageResponseDto] })
  messages!: TicketMessageResponseDto[];
}

export class PaginatedTicketsDto {
  @ApiProperty({ type: [TicketResponseDto] })
  items!: TicketResponseDto[];

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  total!: number;
}