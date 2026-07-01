import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { Issue } from 'src/common/entities/issue.entity';
import { Customer } from 'src/common/entities/customer.entity';
import { Business } from 'src/common/entities/business.entity';
import { AiModule } from 'src/ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Issue, Customer, Business]),
    AiModule,
  ],
  controllers: [WebhooksController],
  providers: [WebhooksService],
})
export class WebhooksModule {}