import { Priority } from 'src/common/enums/priority.enum';
import { SentimentLabel } from 'src/common/enums/sentiment-label.enum';

export type AnalyzeIssueResult = {
  sentimentScore: number;
  sentimentLabel: SentimentLabel;
  category: string;
  priority: Priority;
  summary: string;
};

export type ResolutionSummaryResult = {
  problem: string;
  action: string;
  sentimentShift: string;
};