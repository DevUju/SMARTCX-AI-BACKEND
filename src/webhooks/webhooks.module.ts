import { Module } from '@nestjs/common';
import { IssuesModule } from 'src/issues/issues.module';
import { WebhooksController } from './webhooks.controller';

@Module({
  imports: [IssuesModule],
  controllers: [WebhooksController],
})
export class WebhooksModule {}