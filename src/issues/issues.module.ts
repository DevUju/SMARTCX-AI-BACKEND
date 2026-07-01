import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Issue } from 'src/common/entities/issue.entity';
import { IssuesController } from './issues.controller';
import { IssuesService } from './issues.service';
import { AiModule } from 'src/ai/ai.module';
import { CustomersModule } from 'src/customers/customers.module';
import { GatewayModule } from 'src/gateway/gateway.module';

@Module({
  imports: [TypeOrmModule.forFeature([Issue]), AiModule, CustomersModule, GatewayModule],
  controllers: [IssuesController],
  providers: [IssuesService],
  exports: [IssuesService],
})
export class IssuesModule {}