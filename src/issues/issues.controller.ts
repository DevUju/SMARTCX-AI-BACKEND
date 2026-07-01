import { Body, Controller, Get, Param, Post, Patch, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { AuthenticatedUser } from 'src/auth/types/authenticated-user.type';
import { IssueResponseDto, PaginatedIssuesDto } from './dto/issue-response.dto';
import { ListIssuesQueryDto } from './dto/list-issues-query.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import { IssuesService } from './issues.service';
import { AddIssueMessageDto } from './dto/add-message.dto';
import { QueueInsightResponseDto } from './dto/queue-insight-response.dto';
import { SmartRepliesResponseDto } from './dto/smart-replies-response.dto';
import { TicketDraftResponseDto } from './dto/ticket-draft-response.dto';
@ApiTags('Issues')
@ApiBearerAuth()
@Controller('issues')
export class IssuesController {
  constructor(private readonly issuesService: IssuesService) {}

  @Get()
  @ApiOperation({ summary: 'List issues in current business tenant scope' })
  @ApiResponse({ status: 200, type: PaginatedIssuesDto })
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListIssuesQueryDto,
  ): Promise<PaginatedIssuesDto> {
    return this.issuesService.list(user.businessId, query);
  }

  @Get('insights/queue')
@ApiOperation({ summary: 'Get an AI-generated insight summary for the current issue queue' })
@ApiResponse({ status: 200, type: QueueInsightResponseDto })
async getQueueInsight(
  @CurrentUser() user: AuthenticatedUser,
): Promise<QueueInsightResponseDto> {
  return this.issuesService.getQueueInsight(user.businessId);
}

@Get(':id/ticket-draft')
@ApiOperation({ summary: 'Generate an AI ticket draft from an issue conversation' })
@ApiParam({ name: 'id' })
@ApiResponse({ status: 200, type: TicketDraftResponseDto })
async getTicketDraft(
  @CurrentUser() user: AuthenticatedUser,
  @Param('id') id: string,
): Promise<TicketDraftResponseDto> {
  return this.issuesService.getTicketDraft(user.businessId, id);
}

@Get(':id/smart-replies')
@ApiOperation({ summary: 'Get AI-generated smart reply suggestions for an issue' })
@ApiParam({ name: 'id' })
@ApiResponse({ status: 200, type: SmartRepliesResponseDto })
async getSmartReplies(
  @CurrentUser() user: AuthenticatedUser,
  @Param('id') id: string,
): Promise<SmartRepliesResponseDto> {
  return this.issuesService.getSmartReplies(user.businessId, id);
}

  @Post(':id/messages')
@ApiOperation({ summary: 'Agent sends a reply message on an issue' })
@ApiParam({ name: 'id' })
@ApiResponse({ status: 201, type: IssueResponseDto })
async addMessage(
  @CurrentUser() user: AuthenticatedUser,
  @Param('id') id: string,
  @Body() dto: AddIssueMessageDto,
): Promise<IssueResponseDto> {
  return this.issuesService.addMessage(user.businessId, id, dto.content);
}

  @Get(':id')
  @ApiOperation({ summary: 'Get an issue by id in current business tenant scope' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: IssueResponseDto })
  async getById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<IssueResponseDto> {
    return this.issuesService.getById(user.businessId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update issue fields in current business tenant scope' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: IssueResponseDto })
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateIssueDto,
  ): Promise<IssueResponseDto> {
    return this.issuesService.update(user.businessId, id, dto);
  }
}