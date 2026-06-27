import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
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