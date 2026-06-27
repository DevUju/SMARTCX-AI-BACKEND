import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User, Task, Project, Event } from '../entities';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Agnes123.',
  database: process.env.DB_NAME,
  entities: [User, Task, Project, Event],
  synchronize: true,
  logging: process.env.NODE_ENV === 'development',
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
};

console.log(process.env.DB_PASSWORD);
console.log(typeof process.env.DB_PASSWORD);
