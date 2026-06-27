import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { Task } from '../../entities/task.entity';
import { Project } from '../../entities/project.entity';
import { Event } from '../../entities/event.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Task, Project, Event])],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
