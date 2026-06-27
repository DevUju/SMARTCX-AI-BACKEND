import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../../entities/user.entity';
import { Task } from '../../entities/task.entity';
import { Project } from '../../entities/project.entity';
import { Event } from '../../entities/event.entity';

@Injectable()
export class SeedService {
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,

    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,

    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  async seed(): Promise<void> {
    console.log('🌱 Starting database seeding...');

    await this.clearDatabase();

    const users = await this.createUsers();
    console.log(`✅ Users created: ${users.length}`);

    const tasks = await this.createTasks(users);
    console.log(`✅ Tasks created: ${tasks.length}`);

    const projects = await this.createProjects(users);
    console.log(`✅ Projects created: ${projects.length}`);

    const events = await this.createEvents(users);
    console.log(`✅ Events created: ${events.length}`);

    console.log('✨ Database seeding completed successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('-------------------');

    users.forEach((user) => {
      console.log(`Email: ${user.email}`);
      console.log('Password: password123');
      console.log(`Persona: ${user.persona}`);
      console.log('-------------------');
    });
  }

  private async clearDatabase(): Promise<void> {
    console.log('🧹 Clearing existing data...');

    await this.taskRepository.createQueryBuilder().delete().execute();
    await this.eventRepository.createQueryBuilder().delete().execute();
    await this.projectRepository.createQueryBuilder().delete().execute();
    await this.userRepository.createQueryBuilder().delete().execute();
  }

  private async createUsers(): Promise<User[]> {
    const usersData = [
      {
        fullName: 'John Manager',
        email: 'manager@smartcx.local',
        password: 'password123',
        persona: 'Manager',
      },
      {
        fullName: 'Sarah Freelancer',
        email: 'freelancer@smartcx.local',
        password: 'password123',
        persona: 'Freelancer',
      },
      {
        fullName: 'Alex Executive',
        email: 'executive@smartcx.local',
        password: 'password123',
        persona: 'Executive',
      },
      {
        fullName: 'Demo User',
        email: 'demo@smartcx.local',
        password: 'password123',
        persona: 'Manager',
      },
    ];

    const users: User[] = [];

    for (const userData of usersData) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = this.userRepository.create({
        ...userData,
        password: hashedPassword,
      });
      users.push(await this.userRepository.save(user));
    }

    return users;
  }

  private async createTasks(users: User[]): Promise<Task[]> {
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const tasksData = [
      {
        title: 'Complete Q4 Report',
        description: 'Prepare quarterly performance report for stakeholders',
        status: 'pending',
        priority: 'high',
        dueDate: tomorrow,
        userId: users[0].id,
      },
      {
        title: 'Review Team Performance',
        description: 'Evaluate team members performance and provide feedback',
        status: 'in-progress',
        priority: 'high',
        dueDate: nextWeek,
        userId: users[0].id,
      },
      {
        title: 'Plan Next Sprint',
        description: 'Define sprint goals and assign tasks to team members',
        status: 'completed',
        priority: 'medium',
        dueDate: today,
        userId: users[0].id,
      },
      {
        title: 'Design UI Mockups',
        description: 'Create mockups for new dashboard component',
        status: 'in-progress',
        priority: 'high',
        dueDate: tomorrow,
        userId: users[1].id,
      },
      {
        title: 'Client Presentation',
        description: 'Present design concepts to client for feedback',
        status: 'pending',
        priority: 'medium',
        dueDate: nextWeek,
        userId: users[1].id,
      },
      {
        title: 'Board Meeting Preparation',
        description: 'Prepare slides and talking points for board meeting',
        status: 'pending',
        priority: 'high',
        dueDate: tomorrow,
        userId: users[2].id,
      },
      {
        title: 'Budget Review',
        description: 'Review budget allocation for Q4',
        status: 'completed',
        priority: 'high',
        dueDate: today,
        userId: users[2].id,
      },
      {
        title: 'Get Started Tutorial',
        description: 'Complete the SmartCX AI tutorial to learn features',
        status: 'pending',
        priority: 'medium',
        dueDate: tomorrow,
        userId: users[3].id,
      },
      {
        title: 'Explore Dashboard',
        description: 'Explore all dashboard features and analytics',
        status: 'in-progress',
        priority: 'low',
        dueDate: nextWeek,
        userId: users[3].id,
      },
    ];

    const tasks: Task[] = [];
    for (const taskData of tasksData) {
      tasks.push(
        await this.taskRepository.save(this.taskRepository.create(taskData)),
      );
    }
    return tasks;
  }

  private async createProjects(users: User[]): Promise<Project[]> {
    const projectsData = [
      {
        name: 'Mobile App Development',
        description:
          'Development of new mobile application for iOS and Android',
        status: 'in-progress',
        progress: 65,
        userId: users[0].id,
      },
      {
        name: 'Cloud Migration',
        description: 'Migrate on-premise infrastructure to cloud',
        status: 'in-progress',
        progress: 40,
        userId: users[0].id,
      },
      {
        name: 'Legacy System Upgrade',
        description: 'Upgrade legacy systems to modern architecture',
        status: 'completed',
        progress: 100,
        userId: users[0].id,
      },
      {
        name: 'Website Redesign',
        description: 'Complete redesign of company website',
        status: 'in-progress',
        progress: 75,
        userId: users[1].id,
      },
      {
        name: 'Branding Project',
        description: 'Create new brand identity and guidelines',
        status: 'pending',
        progress: 10,
        userId: users[1].id,
      },
      {
        name: 'Digital Transformation',
        description: 'Company-wide digital transformation initiative',
        status: 'in-progress',
        progress: 50,
        userId: users[2].id,
      },
      {
        name: 'Learning Project',
        description: 'Sample project for testing the application',
        status: 'pending',
        progress: 25,
        userId: users[3].id,
      },
    ];

    const projects: Project[] = [];
    for (const projectData of projectsData) {
      projects.push(
        await this.projectRepository.save(
          this.projectRepository.create(projectData),
        ),
      );
    }
    return projects;
  }

  private async createEvents(users: User[]): Promise<Event[]> {
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const twoWeeks = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);

    const eventsData = [
      {
        title: 'Team Standup',
        description: 'Daily team standup meeting',
        date: tomorrow,
        userId: users[0].id,
      },
      {
        title: 'One-on-One with Sarah',
        description: 'Individual performance review with team member',
        date: nextWeek,
        userId: users[0].id,
      },
      {
        title: 'Project Review Meeting',
        description: 'Review progress on current projects',
        date: twoWeeks,
        userId: users[0].id,
      },
      {
        title: 'Client Call',
        description: 'Call with client to discuss project requirements',
        date: tomorrow,
        userId: users[1].id,
      },
      {
        title: 'Design Workshop',
        description: 'Interactive design workshop with team',
        date: nextWeek,
        userId: users[1].id,
      },
      {
        title: 'Board Meeting',
        description: 'Quarterly board meeting',
        date: tomorrow,
        userId: users[2].id,
      },
      {
        title: 'Strategy Session',
        description: 'Company strategy planning session',
        date: twoWeeks,
        userId: users[2].id,
      },
      {
        title: 'Sample Meeting',
        description: 'Sample event for demonstration',
        date: tomorrow,
        userId: users[3].id,
      },
    ];

    const events: Event[] = [];
    for (const eventData of eventsData) {
      events.push(
        await this.eventRepository.save(this.eventRepository.create(eventData)),
      );
    }
    return events;
  }
}
