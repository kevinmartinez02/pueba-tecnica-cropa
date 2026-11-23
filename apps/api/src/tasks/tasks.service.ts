import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcrypt';
import type { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto.js';
import { Task, TaskStatus } from './models/task.entity.js';
import { User } from './models/user.entity.js';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
  ) {}

  async login({ username, password }: LoginDto) {
    const user = await this.usersRepository.findOne({
      where: { username },
      select: {
        id: true,
        username: true,
        name: true,
        password: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid username or password');
    }

    return {
      id: user.id,
      username: user.username,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  findUsers() {
    return this.usersRepository.find({
      select: { id: true, username: true, name: true },
      order: { name: 'ASC' },
    });
  }

  findAll(userId?: number) {
    return this.tasksRepository.find({
      where: userId !== undefined ? { user: { id: userId } } : {},
      relations: { user: true },
      order: { createdAt: 'DESC' },
    });
  }

  async assignTaskToUser(taskId: number, userId: number) {
    const task = await this.tasksRepository.findOne({
      where: { id: taskId },
      relations: { user: true },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    task.user = await this.findUserForAssignment(userId);
    return this.tasksRepository.save(task);
  }

  async create(createTaskDto: CreateTaskDto) {
    const user = await this.findUserForAssignment(createTaskDto.userId);
    const task = this.tasksRepository.create({
      title: createTaskDto.title.trim(),
      description: createTaskDto.description?.trim() || null,
      status: TaskStatus.PENDING,
      user,
    });

    return this.tasksRepository.save(task);
  }

  private async findUserForAssignment(userId: number) {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('The assigned user does not exist');
    }

    return user;
  }

  async updateStatus(id: number, { status }: UpdateTaskStatusDto) {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: { user: true },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    task.status = status;
    return this.tasksRepository.save(task);
  }

}
