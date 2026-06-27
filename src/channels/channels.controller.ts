import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { AuthenticatedUser } from 'src/auth/types/authenticated-user.type';
import { Channel } from 'src/common/entities/channel.entity';
import { ConnectChannelDto } from './dto/connect-channel.dto';
import { ChannelsService } from './channels.service';

@ApiTags('Channels')
@ApiBearerAuth()
@Controller('channels')
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @Get()
  @ApiOperation({ summary: 'List connected channels for current business' })
  @ApiResponse({ status: 200, type: [Channel] })
  async list(@CurrentUser() user: AuthenticatedUser): Promise<Channel[]> {
    return this.channelsService.list(user.businessId);
  }

  @Post('connect')
  @ApiOperation({ summary: 'Connect or update a channel for current business' })
  @ApiResponse({ status: 201, type: Channel })
  async connect(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ConnectChannelDto,
  ): Promise<Channel> {
    return this.channelsService.connect(user.businessId, dto);
  }
}