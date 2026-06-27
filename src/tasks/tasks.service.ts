import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../entities';
import { CreateTaskDto, UpdateTaskDto } from './tasks.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: string) {
    const task = this.taskRepository.create({
      ...createTaskDto,
      userId,
      status: 'pending',
    });
    return this.taskRepository.save(task);
  }

  async findAll(userId: string, status?: string) {
    const query = this.taskRepository.createQueryBuilder('task')
      .where('task.userId = :userId', { userId });

    if (status) {
      query.andWhere('task.status = :status', { status });
    }

    return query.orderBy('task.createdAt', 'DESC').getMany();
  }

  async findOne(id: string, userId: string) {
    return this.taskRepository.findOne({
      where: { id, userId },
    });
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string) {
    const task = await this.findOne(id, userId);
    if (!task) {
      throw new Error('Task not found');
    }

    Object.assign(task, updateTaskDto);
    return this.taskRepository.save(task);
  }

  async remove(id: string, userId: string) {
    const task = await this.findOne(id, userId);
    if (!task) {
      throw new Error('Task not found');
    }

    return this.taskRepository.remove(task);
  }

  async complete(id: string, userId: string) {
    return this.update(id, { status: 'completed' } as UpdateTaskDto, userId);
  }

  async getTasksByProject(projectId: string, userId: string) {
    return this.taskRepository.find({
      where: { projectId, userId },
      order: { createdAt: 'DESC' },
    });
  }
}
