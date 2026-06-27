import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Issue } from 'src/common/entities/issue.entity';
import { ListIssuesQueryDto } from './dto/list-issues-query.dto';
import { IssueResponseDto, PaginatedIssuesDto } from './dto/issue-response.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';

@Injectable()
export class IssuesService {
  constructor(
    @InjectRepository(Issue)
    private readonly issueRepository: Repository<Issue>,
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
}