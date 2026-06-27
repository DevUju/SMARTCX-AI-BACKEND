import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Request, Query, ValidationPipe } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto } from './projects.dto';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('projects')
@UseGuards(JwtGuard)
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Post()
  async create(@Body(ValidationPipe) createProjectDto: CreateProjectDto, @Request() req) {
    return this.projectsService.create(createProjectDto, req.user.id);
  }

  @Get()
  async findAll(@Request() req, @Query('status') status?: string) {
    return this.projectsService.findAll(req.user.id, status);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.projectsService.findOne(id, req.user.id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body(ValidationPipe) updateProjectDto: UpdateProjectDto, @Request() req) {
    return this.projectsService.update(id, updateProjectDto, req.user.id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.projectsService.remove(id, req.user.id);
  }
}
