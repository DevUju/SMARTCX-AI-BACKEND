import { AppDataSource } from '../data-source';
import { seedDatabase } from './demo.seed';

async function main(): Promise<void> {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connection established');
    await seedDatabase(AppDataSource);
    await AppDataSource.destroy();
    console.log('✅ Seeding complete and database closed');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

void main();
