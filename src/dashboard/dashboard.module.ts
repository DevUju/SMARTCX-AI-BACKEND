import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from 'src/common/entities/ticket.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { AiModule } from 'src/ai/ai.module';


@Module({
  imports: [TypeOrmModule.forFeature([Ticket]), AiModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}