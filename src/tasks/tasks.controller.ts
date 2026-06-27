import { Controller, Get, Post, Body, Param, Put, Delete, Patch, UseGuards, Request, Query, ValidationPipe } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from './tasks.dto';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('tasks')
@UseGuards(JwtGuard)
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Post()
  async create(@Body(ValidationPipe) createTaskDto: CreateTaskDto, @Request() req) {
    return this.tasksService.create(createTaskDto, req.user.id);
  }

  @Get()
  async findAll(@Request() req, @Query('status') status?: string) {
    return this.tasksService.findAll(req.user.id, status);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.tasksService.findOne(id, req.user.id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body(ValidationPipe) updateTaskDto: UpdateTaskDto, @Request() req) {
    return this.tasksService.update(id, updateTaskDto, req.user.id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.tasksService.remove(id, req.user.id);
  }

  @Patch(':id/complete')
  async complete(@Param('id') id: string, @Request() req) {
    return this.tasksService.complete(id, req.user.id);
  }

  @Get('project/:projectId')
  async getTasksByProject(@Param('projectId') projectId: string, @Request() req) {
    return this.tasksService.getTasksByProject(projectId, req.user.id);
  }
}
