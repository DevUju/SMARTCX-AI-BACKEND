import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from 'src/common/entities/message.entity';
import { Ticket } from 'src/common/entities/ticket.entity';
import { MessagesService } from './messages.service';

@Module({
  imports: [TypeOrmModule.forFeature([Message, Ticket])],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}