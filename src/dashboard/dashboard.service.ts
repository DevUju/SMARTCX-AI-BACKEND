import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Ticket } from 'src/common/entities/ticket.entity';
import { TicketStatus } from 'src/common/enums/ticket-status.enum';
import { DashboardMetricsDto } from './dto/dashboard-metrics.dto';
import { DashboardTrendPointDto, DashboardTrendsDto } from './dto/dashboard-trends.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
  ) {}

  async getMetrics(businessId: string): Promise<DashboardMetricsDto> {
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    const [openTickets, resolvedLast24h, resolvedPrev24h] = await Promise.all([
      this.ticketRepository.count({
        where: { businessId, status: TicketStatus.OPEN },
      }),
      this.ticketRepository.count({
        where: {
          businessId,
          status: TicketStatus.RESOLVED,
          resolvedAt: Between(dayAgo, now),
        },
      }),
      this.ticketRepository.count({
        where: {
          businessId,
          status: TicketStatus.RESOLVED,
          resolvedAt: Between(twoDaysAgo, dayAgo),
        },
      }),
    ]);

    const resolvedLast24hChangePercent =
      resolvedPrev24h === 0
        ? resolvedLast24h > 0
          ? 100
          : 0
        : Math.round(((resolvedLast24h - resolvedPrev24h) / resolvedPrev24h) * 100);

    const avgResponseHours = await this.getAverageResolutionHours(businessId);

    return {
      openTickets,
      resolvedLast24h,
      resolvedLast24hChangePercent,
      avgResponseHours,
    };
  }

  async getTrends(businessId: string): Promise<DashboardTrendsDto> {
    const [openedRaw, resolvedRaw] = await Promise.all([
      this.ticketRepository
        .createQueryBuilder('ticket')
        .select("to_char(ticket.createdAt, 'HH24:00')", 'time')
        .addSelect('COUNT(ticket.id)', 'count')
        .where('ticket.businessId = :businessId', { businessId })
        .andWhere("ticket.createdAt >= NOW() - INTERVAL '24 hours'")
        .groupBy("to_char(ticket.createdAt, 'HH24:00')")
        .getRawMany<{ time: string; count: string }>(),
      this.ticketRepository
        .createQueryBuilder('ticket')
        .select("to_char(ticket.resolvedAt, 'HH24:00')", 'time')
        .addSelect('COUNT(ticket.id)', 'count')
        .where('ticket.businessId = :businessId', { businessId })
        .andWhere('ticket.status = :status', { status: TicketStatus.RESOLVED })
        .andWhere("ticket.resolvedAt >= NOW() - INTERVAL '24 hours'")
        .groupBy("to_char(ticket.resolvedAt, 'HH24:00')")
        .getRawMany<{ time: string; count: string }>(),
    ]);

    const openedMap = new Map<string, number>(
      openedRaw.map((item) => [item.time, Number(item.count)]),
    );
    const resolvedMap = new Map<string, number>(
      resolvedRaw.map((item) => [item.time, Number(item.count)]),
    );

    // Generate all hours in the last 24 hours
    const now = new Date();
    const hours: string[] = [];
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
      hours.push(String(hour.getHours()).padStart(2, '0') + ':00');
    }

    const points: DashboardTrendPointDto[] = hours.map((time) => ({
      time,
      ticketsOpened: openedMap.get(time) ?? 0,
      ticketsResolved: resolvedMap.get(time) ?? 0,
    }));

    return { points };
  }

  private async getAverageResolutionHours(businessId: string): Promise<number> {
    const raw = await this.ticketRepository
      .createQueryBuilder('ticket')
      .select('AVG(EXTRACT(EPOCH FROM (ticket.resolvedAt - ticket.createdAt)) / 3600)', 'avgHours')
      .where('ticket.businessId = :businessId', { businessId })
      .andWhere('ticket.status = :status', { status: TicketStatus.RESOLVED })
      .andWhere('ticket.resolvedAt IS NOT NULL')
      .getRawOne<{ avgHours: string | null }>();

    return raw?.avgHours ? Number(Number(raw.avgHours).toFixed(1)) : 0;
  }
}