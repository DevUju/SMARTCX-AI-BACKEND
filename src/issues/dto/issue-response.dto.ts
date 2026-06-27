import { ApiProperty } from '@nestjs/swagger';
import { ChannelType } from 'src/common/enums/channel-type.enum';
import { IssueStatus } from 'src/common/enums/issue-status.enum';
import { Priority } from 'src/common/enums/priority.enum';
import { SentimentLabel } from 'src/common/enums/sentiment-label.enum';

export class IssueResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  businessId!: string;

  @ApiProperty()
  customerId!: string;

  @ApiProperty({ enum: ChannelType })
  channelType!: ChannelType;

  @ApiProperty()
  messagePreview!: string;

  @ApiProperty({ type: 'array', items: { type: 'object', additionalProperties: true } })
  rawMessages!: Array<Record<string, unknown>>;

  @ApiProperty()
  sentimentScore!: number;

  @ApiProperty({ enum: SentimentLabel })
  sentimentLabel!: SentimentLabel;

  @ApiProperty()
  category!: string;

  @ApiProperty({ enum: Priority })
  priority!: Priority;

  @ApiProperty({ enum: IssueStatus })
  status!: IssueStatus;

  @ApiProperty()
  aiAnalysisSummary!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class PaginatedIssuesDto {
  @ApiProperty({ type: [IssueResponseDto] })
  items!: IssueResponseDto[];

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  total!: number;
}