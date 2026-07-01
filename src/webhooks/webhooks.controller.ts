import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InboundWebhookDto } from './dto/inbound-webhook.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { ChannelType } from 'src/common/enums';
import { IssueResponseDto } from 'src/issues/dto/issue-response.dto';
import { IssuesService } from 'src/issues/issues.service';


type WebhookAck = {
  accepted: boolean;
  provider: 'whatsapp' | 'instagram';
  eventId: string;
};

@ApiTags('Webhooks')
@ApiBearerAuth()
@Controller('webhooks')
export class WebhooksController {
constructor(private readonly issuesService: IssuesService) {}

  @Public()
  @Post('whatsapp')
  @ApiOperation({ summary: 'Receive WhatsApp message and create an Issue' })
  @ApiResponse({ status: 201, type: IssueResponseDto })
  async whatsapp(@Body() dto: InboundWebhookDto): Promise<IssueResponseDto> {
    return this.createIssueFromWebhook(dto, ChannelType.WHATSAPP);
  }

  @Public()
  @Post('instagram')
  @ApiOperation({ summary: 'Receive Instagram message and create an Issue' })
  @ApiResponse({ status: 201, type: IssueResponseDto })
  async instagram(@Body() dto: InboundWebhookDto): Promise<IssueResponseDto> {
    return this.createIssueFromWebhook(dto, ChannelType.INSTAGRAM);
  }

  private async createIssueFromWebhook(
    dto: InboundWebhookDto,
    channelType: ChannelType,
  ): Promise<IssueResponseDto> {
    return this.issuesService.create(dto.businessId, {
      customerName: dto.customerName,
      channelType,
      phone: dto.phone,
      email: dto.email,
      message: dto.message,
    });
  }
}