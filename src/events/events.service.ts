import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Event } from '../entities';
import { CreateEventDto, UpdateEventDto } from './events.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
  ) {}

  async create(createEventDto: CreateEventDto, userId: string) {
    const event = this.eventRepository.create({
      ...createEventDto,
      userId,
    });
    return this.eventRepository.save(event);
  }

  async findAll(userId: string) {
    return this.eventRepository.find({
      where: { userId },
      order: { date: 'ASC' },
    });
  }

  async findOne(id: string, userId: string) {
    return this.eventRepository.findOne({
      where: { id, userId },
    });
  }

  async findByDateRange(userId: string, startDate: Date, endDate: Date) {
    return this.eventRepository.find({
      where: {
        userId,
        date: Between(startDate, endDate),
      },
      order: { date: 'ASC' },
    });
  }

  async update(id: string, updateEventDto: UpdateEventDto, userId: string) {
    const event = await this.eventRepository.findOne({
      where: { id, userId },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    Object.assign(event, updateEventDto);
    return this.eventRepository.save(event);
  }

  async remove(id: string, userId: string) {
    const event = await this.eventRepository.findOne({
      where: { id, userId },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    return this.eventRepository.remove(event);
  }
}
