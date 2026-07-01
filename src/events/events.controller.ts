import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Request, Query, ValidationPipe } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { EventsService } from './events.service';
import { CreateEventDto, UpdateEventDto } from './events.dto';
import { JwtGuard } from '../auth/jwt.guard';

type AuthRequest = ExpressRequest & { user: { id: string } };

@Controller('events')
@UseGuards(JwtGuard)
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Post()
  async create(@Body(ValidationPipe) createEventDto: CreateEventDto, @Request() req: AuthRequest) {
    return this.eventsService.create(createEventDto, req.user.id);
  }

  @Get()
  async findAll(@Request() req: AuthRequest) {
    return this.eventsService.findAll(req.user.id);
  }

  @Get('range')
  async findByDateRange(
    @Request() req: AuthRequest,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.eventsService.findByDateRange(
      req.user.id,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.eventsService.findOne(id, req.user.id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body(ValidationPipe) updateEventDto: UpdateEventDto, @Request() req: AuthRequest) {
    return this.eventsService.update(id, updateEventDto, req.user.id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.eventsService.remove(id, req.user.id);
  }
}
