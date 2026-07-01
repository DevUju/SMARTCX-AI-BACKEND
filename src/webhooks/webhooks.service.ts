import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiService } from 'src/ai/ai.service';
import { Business } from 'src/common/entities/business.entity';
import { Customer } from 'src/common/entities/customer.entity';
import { Issue } from 'src/common/entities/issue.entity';
import { ChannelType } from 'src/common/enums/channel-type.enum';
import { CustomerStatus } from 'src/common/enums/customer-status.enum';
import { IssueStatus } from 'src/common/enums/issue-status.enum';
import { Priority } from 'src/common/enums/priority.enum';
import { SentimentLabel } from 'src/common/enums/sentiment-label.enum';
import { InboundWebhookDto } from './dto/inbound-webhook.dto';

export type WebhookAck = {
  accepted: boolean;
  provider: ChannelType;
  eventId: string;
  reason?: string;
};

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    @InjectRepository(Issue)
    private readonly issueRepository: Repository<Issue>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    private readonly aiService: AiService,
  ) {}

  async handleInbound(provider: ChannelType, dto: InboundWebhookDto): Promise<WebhookAck> {
    const { eventId, payload } = dto;
    const content = this.extractMessageContent(provider, payload);
    if (!content) {
      this.logger.warn(`Inbound webhook ${eventId} missing content for provider ${provider}`);
      return { accepted: false, provider, eventId, reason: 'Missing message content' };
    }

    const business = await this.findBusinessForInbound(provider, payload);
    if (!business) {
      this.logger.warn(`Inbound webhook ${eventId} could not resolve business for provider ${provider}`);
      return { accepted: false, provider, eventId, reason: 'Business not found' };
    }

    const customer = await this.findOrCreateCustomer(provider, business.id, payload);

    const analysis = await this.safeAnalyzeIssue([content]);
    const issue = this.issueRepository.create({
      businessId: business.id,
      customerId: customer.id,
      channelType: provider,
      messagePreview: this.buildMessagePreview(payload, content),
      rawMessages: [this.buildRawMessage(provider, dto)],
      sentimentScore: analysis.sentimentScore,
      sentimentLabel: analysis.sentimentLabel,
      category: analysis.category,
      priority: analysis.priority,
      aiAnalysisSummary: analysis.summary,
      status: IssueStatus.NEW,
    });

    await this.issueRepository.save(issue);
    return { accepted: true, provider, eventId };
  }

  private async findBusinessForInbound(
    provider: ChannelType,
    payload: any,
  ): Promise<Business | null> {
    const businessId = this.safeString(payload.businessId);
    if (businessId) {
      return this.businessRepository.findOne({ where: { id: businessId } });
    }

    if (provider === ChannelType.EMAIL) {
      const recipientEmail = this.extractFirstEmail([
        payload.to,
        payload.recipient,
        payload.toEmail,
        payload.destination,
        payload.envelope?.to,
        payload.recipients,
        payload.headers?.to,
        payload.headers?.cc,
        payload.headers?.bcc,
      ]);

      if (recipientEmail) {
        return this.businessRepository.findOne({
          where: { email: recipientEmail.toLowerCase() },
        });
      }
    }

    return null;
  }

  private async findOrCreateCustomer(
    provider: ChannelType,
    businessId: string,
    payload: any,
  ): Promise<Customer> {
    const fromEmail = this.extractFirstEmail([
      payload.from,
      payload.senderEmail,
      payload.envelope?.from,
      payload.fromEmail,
      payload.sender,
      payload.headers?.from,
    ]);
    const phone = this.safeString(payload.phone) || this.safeString(payload.fromPhone) || this.safeString(payload.senderPhone);
    const name = this.extractCustomerName(payload) || this.buildFallbackName(fromEmail, phone);

    let customer: Customer | null = null;
    if (fromEmail) {
      customer = await this.customerRepository
        .createQueryBuilder('customer')
        .where('customer.businessId = :businessId', { businessId })
        .andWhere('LOWER(customer.email) = :email', { email: fromEmail.toLowerCase() })
        .getOne();
    }

    if (!customer && phone) {
      customer = await this.customerRepository.findOne({
        where: { businessId, phone },
      });
    }

    if (customer) {
      return customer;
    }

    const customerData: Partial<Customer> = {
      businessId,
      name,
      phone: phone || null,
      email: fromEmail || null,
      channel: provider,
      totalSpent: 0,
      location: null,
      status: CustomerStatus.NEW,
    };

    const createdCustomer = this.customerRepository.create(customerData as Customer);
    return this.customerRepository.save(createdCustomer);
  }

  private async safeAnalyzeIssue(messages: string[]) {
    try {
      return await this.aiService.analyzeIssue(messages);
    } catch (error) {
      this.logger.warn('AI analysis failed for inbound webhook, using fallback values', error instanceof Error ? error.message : undefined);
      return {
        sentimentScore: 0,
        sentimentLabel: SentimentLabel.NEUTRAL,
        category: 'General',
        priority: Priority.MEDIUM,
        summary: messages.join(' ').slice(0, 150),
      };
    }
  }

  private extractMessageContent(provider: ChannelType, payload: any): string | null {
    const textValues = [
      this.safeString(payload.body),
      this.safeString(payload.text),
      this.safeString(payload.message),
      this.safeString(payload.content),
      this.safeString(payload.description),
      this.safeString(payload.html),
    ].filter(Boolean) as string[];

    if (textValues.length > 0) {
      return textValues.join('\n').trim();
    }

    if (provider === ChannelType.EMAIL) {
      const subject = this.safeString(payload.subject);
      const body = this.safeString(payload.body);
      if (subject && body) {
        return `${subject}\n\n${body}`;
      }
      return subject || body || null;
    }

    return null;
  }

  private buildMessagePreview(payload: Record<string, unknown>, content: string): string {
    const subject = this.safeString(payload.subject);
    const preview = subject ? `${subject} - ${content}` : content;
    return preview.length > 120 ? preview.slice(0, 117).trimEnd() + '...' : preview;
  }

  private buildRawMessage(provider: ChannelType, dto: InboundWebhookDto): Record<string, unknown> {
    return {
      provider,
      eventId: dto.eventId,
      source: dto.source,
      payload: dto.payload,
      receivedAt: new Date().toISOString(),
    };
  }

  private extractFirstEmail(values: unknown[]): string | null {
    for (const value of values) {
      const result = this.extractEmailString(value);
      if (result) {
        return result;
      }
    }
    return null;
  }

  private extractEmailString(value: unknown): string | null {
    if (Array.isArray(value)) {
      for (const item of value) {
        const email = this.extractEmailString(item);
        if (email) {
          return email;
        }
      }
      return null;
    }

    if (typeof value === 'object' && value !== null) {
      const objectValue = value as Record<string, unknown>;
      return this.extractFirstEmail([
        objectValue.email,
        objectValue.address,
        objectValue.to,
        objectValue.from,
        objectValue.recipient,
      ]);
    }

    const text = this.safeString(value);
    if (!text) {
      return null;
    }
    const match = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    return match ? match[0].toLowerCase() : null;
  }

  private extractCustomerName(payload: any): string | null {
    return this.safeString(payload.fromName) || this.safeString(payload.senderName) || this.safeString(payload.name);
  }

  private safeString(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
  }

  private buildFallbackName(email: string | null, phone: string | null): string {
    if (email) {
      return email.split('@')[0];
    }
    if (phone) {
      return `Customer ${phone}`;
    }
    return 'Email Customer';
  }
}
