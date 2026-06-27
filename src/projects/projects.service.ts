import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../entities';
import { CreateProjectDto, UpdateProjectDto } from './projects.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
  ) {}

  async create(createProjectDto: CreateProjectDto, userId: string) {
    const project = this.projectRepository.create({
      ...createProjectDto,
      userId,
      status: 'active',
    });
    return this.projectRepository.save(project);
  }

  async findAll(userId: string, status?: string) {
    const query = this.projectRepository.createQueryBuilder('project')
      .where('project.userId = :userId', { userId });

    if (status) {
      query.andWhere('project.status = :status', { status });
    }

    return query.orderBy('project.createdAt', 'DESC').getMany();
  }

  async findOne(id: string, userId: string) {
    return this.projectRepository.findOne({
      where: { id, userId },
      relations: ['tasks'],
    });
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, userId: string) {
    const project = await this.projectRepository.findOne({
      where: { id, userId },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    Object.assign(project, updateProjectDto);
    return this.projectRepository.save(project);
  }

  async remove(id: string, userId: string) {
    const project = await this.projectRepository.findOne({
      where: { id, userId },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    return this.projectRepository.remove(project);
  }
}
