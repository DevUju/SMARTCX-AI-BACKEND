import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiModule } from './ai/ai.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { BusinessModule } from './business/business.module';
import { ChannelsModule } from './channels/channels.module';
import { CustomersModule } from './customers/customers.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { getTypeOrmOptions } from './database/typeorm.config';
import { IssuesModule } from './issues/issues.module';
import { TicketsModule } from './tickets/tickets.module';
import { GatewayModule } from './gateway/gateway.module';
import { UsersModule } from './users/users.module';
import { WebhooksModule } from './webhooks/webhooks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => getTypeOrmOptions(),
    }),
    AiModule,
    AuthModule,
    BusinessModule,
    ChannelsModule,
    CustomersModule,
    DashboardModule,
    IssuesModule,
    TicketsModule,
    UsersModule,
    WebhooksModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
