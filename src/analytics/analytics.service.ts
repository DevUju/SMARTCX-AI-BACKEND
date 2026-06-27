import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../entities';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  async getProductivityMetrics(userId: string) {
    const tasks = await this.taskRepository.find({
      where: { userId },
    });

    const completedTasks = tasks.filter((t) => t.status === 'completed');
    const totalTasks = tasks.length;

    // Calculate overall progress
    const overallProgress = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

    // Calculate weekly data (mock for now - can be enhanced with real date logic)
    const weeklyData = this.generateWeeklyData(tasks);

    // Calculate streak (mock for now)
    const streak = this.calculateStreak(completedTasks);

    // Calculate weekly improvement (mock)
    const weeklyImprovement = Math.floor(Math.random() * 20) + 5;

    // Get today's completion
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaysCompletedTasks = completedTasks.filter((t) => {
      const taskDate = new Date(t.updatedAt);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === today.getTime();
    }).length;

    return {
      overallProgress,
      completedTasks: completedTasks.length,
      totalTasks,
      streak,
      weeklyImprovement,
      weeklyData,
      todaysCompletedTasks,
      achievement: overallProgress >= 70 ? 'Deep Work Master' : 'Productive Contributor',
      categoryBreakdown: {
        work: 64,
        personalDevelopment: 22,
        health: 14,
      },
    };
  }

  async getSummary(userId: string) {
    const tasks = await this.taskRepository.find({
      where: { userId },
    });

    const completedTasks = tasks.filter((t) => t.status === 'completed');
    const pendingTasks = tasks.filter((t) => t.status === 'pending');
    const inProgressTasks = tasks.filter((t) => t.status === 'in-progress');

    return {
      totalTasks: tasks.length,
      completedTasks: completedTasks.length,
      pendingTasks: pendingTasks.length,
      inProgressTasks: inProgressTasks.length,
      completionRate: tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0,
    };
  }

  private generateWeeklyData(tasks: Task[]): number[] {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data: number[] = [];

    for (let i = 0; i < days.length; i++) {
      // Generate mock data (can be enhanced with real calculations)
      data.push(Math.floor(Math.random() * 30) + 60);
    }

    return data;
  }

  private calculateStreak(completedTasks: Task[]): number {
    // Mock streak calculation
    return Math.floor(Math.random() * 15) + 1;
  }
}
