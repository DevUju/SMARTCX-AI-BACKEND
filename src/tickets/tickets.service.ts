import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from 'src/common/entities/customer.entity';
import { Issue } from 'src/common/entities/issue.entity';
import { Message } from 'src/common/entities/message.entity';
import { Ticket } from 'src/common/entities/ticket.entity';
import { User } from 'src/common/entities/user.entity';
import { IssueStatus } from 'src/common/enums/issue-status.enum';
import { MessageSenderType } from 'src/common/enums/message-sender-type.enum';
import { TicketStatus } from 'src/common/enums/ticket-status.enum';
import { UserRole } from 'src/common/enums/user-role.enum';
import { AuthenticatedUser } from 'src/auth/types/authenticated-user.type';
import { AddTicketMessageDto } from './dto/add-ticket-message.dto';
import { AssignTicketDto } from './dto/assign-ticket.dto';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { ListTicketsQueryDto } from './dto/list-tickets-query.dto';
import { ResolveTicketDto } from './dto/resolve-ticket.dto';
import {
  PaginatedTicketsDto,
  TicketMessageResponseDto,
  TicketResponseDto,
} from './dto/ticket-response.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(Issue)
    private readonly issueRepository: Repository<Issue>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async create(
    businessId: string,
    actor: AuthenticatedUser,
    input: CreateTicketDto,
  ): Promise<TicketResponseDto> {
    const issue = await this.issueRepository.findOne({
      where: { id: input.issueId, businessId },
    });
    if (!issue) {
      throw new NotFoundException('Issue not found in tenant scope');
    }

    const customer = await this.customerRepository.findOne({
      where: { id: input.customerId, businessId },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found in tenant scope');
    }

    if (input.assignedAgentId) {
      await this.assertAssignableAgent(businessId, input.assignedAgentId);
    }

    const ticketNumber = await this.generateUniqueTicketNumber();
    const created = this.ticketRepository.create({
      businessId,
      issueId: issue.id,
      customerId: customer.id,
      ticketNumber,
      title: input.title,
      category: input.category,
      priority: input.priority,
      status: TicketStatus.OPEN,
      assignedAgentId: input.assignedAgentId ?? null,
      aiDraftSummary: input.aiDraftSummary ?? '',
      aiInsightSummary: input.aiInsightSummary ?? '',
      internalNotes: input.internalNotes ?? [],
      resolvedAt: null,
      resolutionSummary: null,
      sentimentShiftStart: null,
      sentimentShiftEnd: null,
    });

    const savedTicket = await this.ticketRepository.save(created);

    if (input.initialMessages && input.initialMessages.length > 0) {
      const initialMessages = input.initialMessages.map((message) =>
        this.messageRepository.create({
          ticketId: savedTicket.id,
          senderId: actor.userId,
          senderType: MessageSenderType.AGENT,
          content: message.content,
          attachmentUrl: message.attachmentUrl ?? null,
          isInternalNote: false,
        }),
      );
      await this.messageRepository.save(initialMessages);
    }

    if (issue.status !== IssueStatus.CONVERTED) {
      issue.status = IssueStatus.CONVERTED;
      await this.issueRepository.save(issue);
    }

    return this.getById(businessId, savedTicket.id);
  }

  async list(
    businessId: string,
    actor: AuthenticatedUser,
    query: ListTicketsQueryDto,
  ): Promise<PaginatedTicketsDto> {
    const qb = this.ticketRepository
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.messages', 'message')
      .where('ticket.businessId = :businessId', { businessId });

    if (query.status) {
      qb.andWhere('ticket.status = :status', { status: query.status });
    }

    if (query.priority) {
      qb.andWhere('ticket.priority = :priority', { priority: query.priority });
    }

    if (query.mine) {
      qb.andWhere('ticket.assignedAgentId = :assignedAgentId', {
        assignedAgentId: actor.userId,
      });
    }

    if (query.unassigned) {
      qb.andWhere('ticket.assignedAgentId IS NULL');
    }

    if (query.search) {
      qb.andWhere(
        '(LOWER(ticket.ticketNumber) LIKE :search OR LOWER(ticket.title) LIKE :search OR LOWER(ticket.category) LIKE :search)',
        { search: `%${query.search.toLowerCase()}%` },
      );
    }

    const [items, total] = await qb
      .orderBy('ticket.createdAt', 'DESC')
      .addOrderBy('message.createdAt', 'ASC')
      .skip((query.page - 1) * query.limit)
      .take(query.limit)
      .getManyAndCount();

    return {
      items: items.map((ticket) => this.toResponse(ticket)),
      page: query.page,
      limit: query.limit,
      total,
    };
  }

  async getById(businessId: string, ticketId: string): Promise<TicketResponseDto> {
    const ticket = await this.ticketRepository.findOne({
      where: { id: ticketId, businessId },
      relations: { messages: true },
      order: { messages: { createdAt: 'ASC' } },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return this.toResponse(ticket);
  }

  async updateStatus(
    businessId: string,
    ticketId: string,
    input: UpdateTicketStatusDto,
  ): Promise<TicketResponseDto> {
    const ticket = await this.findTenantTicket(businessId, ticketId);

    ticket.status = input.status;
    if (input.status !== TicketStatus.RESOLVED) {
      ticket.resolvedAt = null;
    }

    const saved = await this.ticketRepository.save(ticket);
    return this.toResponse(saved);
  }

  async assign(
    businessId: string,
    ticketId: string,
    input: AssignTicketDto,
  ): Promise<TicketResponseDto> {
    const ticket = await this.findTenantTicket(businessId, ticketId);
    await this.assertAssignableAgent(businessId, input.assignedAgentId);

    ticket.assignedAgentId = input.assignedAgentId;
    const saved = await this.ticketRepository.save(ticket);
    return this.toResponse(saved);
  }

  async addMessage(
    businessId: string,
    ticketId: string,
    actor: AuthenticatedUser,
    input: AddTicketMessageDto,
  ): Promise<TicketMessageResponseDto> {
    await this.findTenantTicket(businessId, ticketId);

    const content = input.content?.trim() ?? '';
    const attachmentUrl = input.attachmentUrl?.trim() ?? null;
    if (!content && !attachmentUrl) {
      throw new BadRequestException('Message content or attachment is required');
    }

    const senderType = input.senderType ?? MessageSenderType.AGENT;
    if (senderType !== MessageSenderType.AGENT && actor.role === UserRole.AGENT) {
      throw new BadRequestException('Agents can only create agent messages');
    }

    const message = this.messageRepository.create({
      ticketId,
      senderId: actor.userId,
      senderType,
      content,
      attachmentUrl,
      isInternalNote: input.isInternalNote ?? false,
    });

    const saved = await this.messageRepository.save(message);
    return this.toMessageResponse(saved);
  }

  async resolve(
    businessId: string,
    ticketId: string,
    input: ResolveTicketDto,
  ): Promise<TicketResponseDto> {
    const ticket = await this.findTenantTicket(businessId, ticketId);

    ticket.status = TicketStatus.RESOLVED;
    ticket.resolvedAt = new Date();
    ticket.resolutionSummary = input.resolutionSummary;
    ticket.sentimentShiftStart = input.sentimentShiftStart ?? ticket.sentimentShiftStart;
    ticket.sentimentShiftEnd = input.sentimentShiftEnd ?? ticket.sentimentShiftEnd;

    const saved = await this.ticketRepository.save(ticket);
    return this.toResponse(saved);
  }

  private async findTenantTicket(businessId: string, ticketId: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { id: ticketId, businessId },
      relations: { messages: true },
      order: { messages: { createdAt: 'ASC' } },
    });
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }
    return ticket;
  }

  private async assertAssignableAgent(businessId: string, assignedAgentId: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: assignedAgentId, businessId },
    });
    if (!user) {
      throw new BadRequestException('Assigned agent not found in tenant scope');
    }
  }

  private toMessageResponse(message: Message): TicketMessageResponseDto {
    return {
      id: message.id,
      ticketId: message.ticketId,
      senderId: message.senderId,
      senderType: message.senderType,
      content: message.content,
      attachmentUrl: message.attachmentUrl,
      isInternalNote: message.isInternalNote,
      createdAt: message.createdAt,
    };
  }

  private toResponse(ticket: Ticket): TicketResponseDto {
    return {
      id: ticket.id,
      businessId: ticket.businessId,
      issueId: ticket.issueId,
      customerId: ticket.customerId,
      ticketNumber: ticket.ticketNumber,
      title: ticket.title,
      category: ticket.category,
      priority: ticket.priority,
      status: ticket.status,
      assignedAgentId: ticket.assignedAgentId,
      aiDraftSummary: ticket.aiDraftSummary,
      aiInsightSummary: ticket.aiInsightSummary,
      internalNotes: ticket.internalNotes,
      resolvedAt: ticket.resolvedAt,
      resolutionSummary: ticket.resolutionSummary,
      sentimentShiftStart: ticket.sentimentShiftStart,
      sentimentShiftEnd: ticket.sentimentShiftEnd,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      messages: (ticket.messages ?? []).map((message) => this.toMessageResponse(message)),
    };
  }

  private async generateUniqueTicketNumber(): Promise<string> {
    for (let i = 0; i < 10; i += 1) {
      const randomSegment = Math.floor(1000 + Math.random() * 9000);
      const ticketNumber = `TCK-${randomSegment}`;
      const exists = await this.ticketRepository.findOne({ where: { ticketNumber } });
      if (!exists) {
        return ticketNumber;
      }
    }
    throw new BadRequestException('Could not generate unique ticket number, try again');
  }
}