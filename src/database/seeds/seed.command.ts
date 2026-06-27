import { NestFactory } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { typeOrmConfig } from '../../config/typeorm.config';
import { SeedService } from './seed.service';
import { User } from '../../entities/user.entity';
import { Task } from '../../entities/task.entity';
import { Project } from '../../entities/project.entity';
import { Event } from '../../entities/event.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    TypeOrmModule.forFeature([User, Task, Project, Event]),
  ],
  providers: [SeedService],
})
export class SeedCliModule {}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(SeedCliModule);

  try {
    const seedService = app.get(SeedService);
    await seedService.seed();
    console.log('\n✨ Seeding complete! Application ready.');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await app.close();
    process.exit(0);
  }
}

bootstrap();
