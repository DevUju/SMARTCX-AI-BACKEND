import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InboundWebhookDto } from './dto/inbound-webhook.dto';

type WebhookAck = {
  accepted: boolean;
  provider: 'whatsapp' | 'instagram';
  eventId: string;
};

@ApiTags('Webhooks')
@ApiBearerAuth()
@Controller('webhooks')
export class WebhooksController {
  @Post('whatsapp')
  @ApiOperation({ summary: 'Receive WhatsApp webhook events' })
  @ApiResponse({ status: 201 })
  async whatsapp(@Body() dto: InboundWebhookDto): Promise<WebhookAck> {
    return { accepted: true, provider: 'whatsapp', eventId: dto.eventId };
  }

  @Post('instagram')
  @ApiOperation({ summary: 'Receive Instagram webhook events' })
  @ApiResponse({ status: 201 })
  async instagram(@Body() dto: InboundWebhookDto): Promise<WebhookAck> {
    return { accepted: true, provider: 'instagram', eventId: dto.eventId };
  }
}