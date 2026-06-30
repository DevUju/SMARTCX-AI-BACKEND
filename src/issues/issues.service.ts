import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Issue } from 'src/common/entities/issue.entity';
import { ListIssuesQueryDto } from './dto/list-issues-query.dto';
import { IssueResponseDto, PaginatedIssuesDto } from './dto/issue-response.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import { CustomersService } from 'src/customers/customers.service';
import { AiService } from 'src/ai/ai.service';
import { IssueStatus } from 'src/common/enums';
import { ChannelType } from 'src/common/enums';
import { RealtimeGateway } from 'src/gateway/realtime.gateway';


export type CreateIssueInput = {
  customerName: string;
  channelType: ChannelType;
  phone?: string;
  email?: string;
  message: string;
};


@Injectable()
export class IssuesService {
  constructor(
    @InjectRepository(Issue)
    private readonly issueRepository: Repository<Issue>,
      private readonly aiService: AiService,
    private readonly customersService: CustomersService,
       private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async list(businessId: string, query: ListIssuesQueryDto): Promise<PaginatedIssuesDto> {
    const qb = this.issueRepository
      .createQueryBuilder('issue')
      .where('issue.businessId = :businessId', { businessId });

    if (query.priority) {
      qb.andWhere('issue.priority = :priority', { priority: query.priority });
    }

    if (query.status) {
      qb.andWhere('issue.status = :status', { status: query.status });
    }

    if (query.search) {
      qb.andWhere(
        '(LOWER(issue.messagePreview) LIKE :search OR LOWER(issue.category) LIKE :search)',
        { search: `%${query.search.toLowerCase()}%` },
      );
    }

    const [items, total] = await qb
      .orderBy('issue.createdAt', 'DESC')
      .skip((query.page - 1) * query.limit)
      .take(query.limit)
      .getManyAndCount();

    return {
      items: items.map((issue) => this.toResponse(issue)),
      page: query.page,
      limit: query.limit,
      total,
    };
  }

  async getById(businessId: string, issueId: string): Promise<IssueResponseDto> {
    const issue = await this.issueRepository.findOne({
      where: { id: issueId, businessId },
    });

    if (!issue) {
      throw new NotFoundException('Issue not found');
    }

    return this.toResponse(issue);
  }

  async update(
    businessId: string,
    issueId: string,
    input: UpdateIssueDto,
  ): Promise<IssueResponseDto> {
    const issue = await this.issueRepository.findOne({
      where: { id: issueId, businessId },
    });

    if (!issue) {
      throw new NotFoundException('Issue not found');
    }

    if (input.priority) {
      issue.priority = input.priority;
    }
    if (input.status) {
      issue.status = input.status;
    }
    if (input.category) {
      issue.category = input.category;
    }
    if (input.aiAnalysisSummary) {
      issue.aiAnalysisSummary = input.aiAnalysisSummary;
    }

    const saved = await this.issueRepository.save(issue);
    return this.toResponse(saved);
  }

  async create(businessId: string, input: CreateIssueInput): Promise<IssueResponseDto> {
    const customer = await this.customersService.findOrCreate(
      businessId,
      input.customerName,
      input.channelType,
      { phone: input.phone, email: input.email },
    );

    const analysis = await this.aiService.analyzeIssue([input.message]);

    const issue = this.issueRepository.create({
      businessId,
      customerId: customer.id,
      channelType: input.channelType,
      messagePreview: input.message.slice(0, 200),
      rawMessages: [{ content: input.message, senderType: 'customer', createdAt: new Date() }],
      sentimentScore: analysis.sentimentScore,
      sentimentLabel: analysis.sentimentLabel,
      category: analysis.category,
      priority: analysis.priority,
      status: IssueStatus.NEW,
      aiAnalysisSummary: analysis.summary,
    });

    const saved = await this.issueRepository.save(issue);
    
     this.realtimeGateway.emitIssueNew({
      businessId: saved.businessId,
      issueId: saved.id,
      priority: saved.priority,
      category: saved.category,
      createdAt: saved.createdAt.toISOString(),
    });
    
    return this.toResponse(saved);
  }

  async addMessage(
  businessId: string,
  issueId: string,
  content: string,
): Promise<IssueResponseDto> {
  const issue = await this.issueRepository.findOne({
    where: { id: issueId, businessId },
  });
  if (!issue) {
    throw new NotFoundException('Issue not found');
  }

  const newMessage = {
    content,
    senderType: 'agent',
    createdAt: new Date(),
  };

  issue.rawMessages = [...issue.rawMessages, newMessage];
  issue.messagePreview = content.slice(0, 200);

  const saved = await this.issueRepository.save(issue);
  return this.toResponse(saved);
}

  private toResponse(issue: Issue): IssueResponseDto {
    return {
      id: issue.id,
      businessId: issue.businessId,
      customerId: issue.customerId,
      channelType: issue.channelType,
      messagePreview: issue.messagePreview,
      rawMessages: issue.rawMessages,
      sentimentScore: issue.sentimentScore,
      sentimentLabel: issue.sentimentLabel,
      category: issue.category,
      priority: issue.priority,
      status: issue.status,
      aiAnalysisSummary: issue.aiAnalysisSummary,
      createdAt: issue.createdAt,
      updatedAt: issue.updatedAt,
    };
  }

  async getSmartReplies(businessId: string, issueId: string): Promise<{ replies: string[] }> {
  const issue = await this.issueRepository.findOne({
    where: { id: issueId, businessId },
  });
  if (!issue) {
    throw new NotFoundException('Issue not found');
  }

  const context = issue.rawMessages
    .map((message) => `${message.senderType}: ${message.content}`)
    .join('\n');

  const replies = await this.aiService.generateSmartReplies(context);
  return { replies };
}

  async getQueueInsight(businessId: string): Promise<{ summary: string }> {
  const recentIssues = await this.issueRepository.find({
    where: { businessId },
    order: { createdAt: 'DESC' },
    take: 20,
  });

  if (recentIssues.length === 0) {
    return { summary: 'No recent issues to analyze yet.' };
  }

  const breakdown = recentIssues.map((issue) => ({
    category: issue.category,
    priority: issue.priority,
  }));

  const summary = await this.aiService.generateInsightSummary({
    totalIssues: recentIssues.length,
    breakdown,
  });

  return { summary };
}

async getTicketDraft(businessId: string, issueId: string): Promise<{ draft: string }> {
  const issue = await this.issueRepository.findOne({
    where: { id: issueId, businessId },
  });
  if (!issue) {
    throw new NotFoundException('Issue not found');
  }

  const customer = await this.customersService.getById(businessId, issue.customerId);

  const conversation = issue.rawMessages.map(
    (message) => `${message.senderType}: ${message.content}`,
  );

  const draft = await this.aiService.generateTicketDraft(conversation, customer.name);
  return { draft };
}


}