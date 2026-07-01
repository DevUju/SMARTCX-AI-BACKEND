import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/auth/decorators/public.decorator';
import { InboundWebhookDto } from './dto/inbound-webhook.dto';
import { WebhooksService, WebhookAck } from './webhooks.service';
import { ChannelType } from 'src/common/enums/channel-type.enum';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Public()
  @Post('whatsapp')
  @ApiOperation({ summary: 'Receive WhatsApp webhook events' })
  @ApiResponse({ status: 201 })
  async whatsapp(@Body() dto: InboundWebhookDto): Promise<WebhookAck> {
    return this.webhooksService.handleInbound(ChannelType.WHATSAPP, dto);
  }

  @Public()
  @Post('instagram')
  @ApiOperation({ summary: 'Receive Instagram webhook events' })
  @ApiResponse({ status: 201 })
  async instagram(@Body() dto: InboundWebhookDto): Promise<WebhookAck> {
    return this.webhooksService.handleInbound(ChannelType.INSTAGRAM, dto);
  }

  @Public()
  @Post('email')
  @ApiOperation({ summary: 'Receive Email webhook events' })
  @ApiResponse({ status: 201 })
  async email(@Body() dto: InboundWebhookDto): Promise<WebhookAck> {
    return this.webhooksService.handleInbound(ChannelType.EMAIL, dto);
  }
}