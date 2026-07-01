import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
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
import { TicketsService } from './tickets.service';

@ApiTags('Tickets')
@ApiBearerAuth()
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a ticket in current business tenant scope' })
  @ApiResponse({ status: 201, type: TicketResponseDto })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateTicketDto,
  ): Promise<TicketResponseDto> {
    return this.ticketsService.create(user.businessId, user, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List tickets in current business tenant scope' })
  @ApiResponse({ status: 200, type: PaginatedTicketsDto })
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListTicketsQueryDto,
  ): Promise<PaginatedTicketsDto> {
    return this.ticketsService.list(user.businessId, user, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ticket detail (workspace payload) in tenant scope' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: TicketResponseDto })
  async getById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<TicketResponseDto> {
    return this.ticketsService.getById(user.businessId, id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update ticket status in tenant scope' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: TicketResponseDto })
  async updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateTicketStatusDto,
  ): Promise<TicketResponseDto> {
    return this.ticketsService.updateStatus(user.businessId, id, dto);
  }

  @Post(':id/assign')
  @ApiOperation({ summary: 'Assign ticket to an agent in tenant scope' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: TicketResponseDto })
  async assign(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: AssignTicketDto,
  ): Promise<TicketResponseDto> {
    return this.ticketsService.assign(user.businessId, id, dto);
  }

  @Post(':id/messages/attachment')
  @ApiOperation({ summary: 'Post ticket message with file attachment in tenant scope' })
  @ApiParam({ name: 'id' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        content: { type: 'string' },
        isInternalNote: { type: 'boolean' },
        senderType: { type: 'string', enum: ['customer', 'agent', 'ai_bot'] },
        file: { type: 'string', format: 'binary' },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 201, type: TicketMessageResponseDto })
  @UseInterceptors(
    FileInterceptor('file', {
      dest: 'uploads/attachments',
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async addMessageWithAttachment(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @UploadedFile() file: { filename: string; originalname: string } | undefined,
    @Body() dto: AddTicketMessageDto,
  ): Promise<TicketMessageResponseDto> {
    if (!file) {
      throw new BadRequestException('Attachment file is required');
    }

    const normalizedContent = dto.content?.trim() ?? file.originalname;
    return this.ticketsService.addMessage(user.businessId, id, user, {
      ...dto,
      content: normalizedContent,
      attachmentUrl: `/uploads/attachments/${file.filename}`,
    });
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Post ticket message in tenant scope' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 201, type: TicketMessageResponseDto })
  async addMessage(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: AddTicketMessageDto,
  ): Promise<TicketMessageResponseDto> {
    return this.ticketsService.addMessage(user.businessId, id, user, dto);
  }

  @Post(':id/resolve')
  @ApiOperation({ summary: 'Resolve ticket and save resolution summary in tenant scope' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: TicketResponseDto })
  async resolve(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: ResolveTicketDto,
  ): Promise<TicketResponseDto> {
    return this.ticketsService.resolve(user.businessId, id, dto);
  }
}