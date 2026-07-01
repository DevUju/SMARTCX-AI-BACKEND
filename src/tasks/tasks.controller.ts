import { Controller, Get, Post, Body, Param, Put, Delete, Patch, UseGuards, Request, Query, ValidationPipe } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from './tasks.dto';
import { JwtGuard } from '../auth/jwt.guard';

type AuthRequest = ExpressRequest & { user: { id: string } };

@Controller('tasks')
@UseGuards(JwtGuard)
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Post()
  async create(@Body(ValidationPipe) createTaskDto: CreateTaskDto, @Request() req: AuthRequest) {
    return this.tasksService.create(createTaskDto, req.user.id);
  }

  @Get()
  async findAll(@Request() req: AuthRequest, @Query('status') status?: string) {
    return this.tasksService.findAll(req.user.id, status);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.tasksService.findOne(id, req.user.id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body(ValidationPipe) updateTaskDto: UpdateTaskDto, @Request() req: AuthRequest) {
    return this.tasksService.update(id, updateTaskDto, req.user.id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.tasksService.remove(id, req.user.id);
  }

  @Patch(':id/complete')
  async complete(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.tasksService.complete(id, req.user.id);
  }

  @Get('project/:projectId')
  async getTasksByProject(@Param('projectId') projectId: string, @Request() req: AuthRequest) {
    return this.tasksService.getTasksByProject(projectId, req.user.id);
  }
}
