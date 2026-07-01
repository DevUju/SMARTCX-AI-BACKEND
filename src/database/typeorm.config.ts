import { DataSourceOptions } from 'typeorm';
import { AuditLog } from 'src/common/entities/audit-log.entity';
import { Business } from 'src/common/entities/business.entity';
import { Channel } from 'src/common/entities/channel.entity';
import { Customer } from 'src/common/entities/customer.entity';
import { Issue } from 'src/common/entities/issue.entity';
import { Message } from 'src/common/entities/message.entity';
import { Ticket } from 'src/common/entities/ticket.entity';
import { User } from 'src/common/entities/user.entity';

export const getTypeOrmOptions = (): DataSourceOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5433),
  database: process.env.DB_NAME ?? 'smart',
  username: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  entities: [Business, User, Channel, Customer, Issue, Ticket, Message, AuditLog],
  migrations: ['dist/database/migrations/*.js'],
  synchronize: false,
  logging: process.env.NODE_ENV !== 'production',
  ssl:
    process.env.NODE_ENV === 'production'
      ? {
          rejectUnauthorized: false,
        }
      : false,
});