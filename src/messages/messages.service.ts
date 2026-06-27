import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from 'src/common/entities/message.entity';
import { Ticket } from 'src/common/entities/ticket.entity';
import { MessageSenderType } from 'src/common/enums/message-sender-type.enum';

export type CreateMessageInput = {
  ticketId: string;
  senderId: string;
  senderType: MessageSenderType;
  content: string;
  attachmentUrl?: string | null;
  isInternalNote?: boolean;
};

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
  ) {}

  async getByTicket(businessId: string, ticketId: string): Promise<Message[]> {
    const ticket = await this.ticketRepository.findOne({ where: { id: ticketId, businessId } });
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return this.messageRepository.find({
      where: { ticketId },
      order: { createdAt: 'ASC' },
    });
  }

  async create(businessId: string, input: CreateMessageInput): Promise<Message> {
    const ticket = await this.ticketRepository.findOne({
      where: { id: input.ticketId, businessId },
    });
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const message = this.messageRepository.create({
      ticketId: input.ticketId,
      senderId: input.senderId,
      senderType: input.senderType,
      content: input.content,
      attachmentUrl: input.attachmentUrl ?? null,
      isInternalNote: input.isInternalNote ?? false,
    });
    return this.messageRepository.save(message);
  }
}