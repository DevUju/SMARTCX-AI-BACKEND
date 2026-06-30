import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from 'src/common/entities/customer.entity';
import { Issue } from 'src/common/entities/issue.entity';
import { Message } from 'src/common/entities/message.entity';
import { Ticket } from 'src/common/entities/ticket.entity';
import { User } from 'src/common/entities/user.entity';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { AiModule } from 'src/ai/ai.module';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, Issue, Customer, User, Message]), AiModule],
  controllers: [TicketsController],
  providers: [TicketsService],
  exports: [TicketsService],
})
export class TicketsModule {}