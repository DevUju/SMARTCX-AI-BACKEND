import 'dotenv/config';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { getTypeOrmOptions } from './typeorm.config';

export const AppDataSource = new DataSource({
  ...getTypeOrmOptions(),
  migrations: ['src/database/migrations/*.ts'],
});
