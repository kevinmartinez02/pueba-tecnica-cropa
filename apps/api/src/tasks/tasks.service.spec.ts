import { NotFoundException } from '@nestjs/common';
import type { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { Task, TaskStatus } from './models/task.entity.js';
import { User } from './models/user.entity.js';
import { TasksService } from './tasks.service.js';

describe('TasksService', () => {
  let service: TasksService;
  let usersRepository: {
    findOneBy: ReturnType<typeof vi.fn>;
    find: ReturnType<typeof vi.fn>;
  };
  let tasksRepository: {
    find: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    usersRepository = {
      findOneBy: vi.fn(),
      find: vi.fn(),
    };
    tasksRepository = {
      find: vi.fn(),
      create: vi.fn(),
      save: vi.fn(),
      findOne: vi.fn(),
    };

    service = new TasksService(
      usersRepository as unknown as Repository<User>,
      tasksRepository as unknown as Repository<Task>,
    );
  });

  it('filters tasks by the assigned user ID', async () => {
    tasksRepository.find.mockResolvedValue([]);

    await service.findAll(7);

    expect(tasksRepository.find).toHaveBeenCalledWith({
      where: { user: { id: 7 } },
      relations: { user: true },
      order: { createdAt: 'DESC' },
    });
  });

  it('assigns a new task to an existing user before saving it', async () => {
    const user = { id: 7, username: 'maria', name: 'Maria' } as User;
    const task = {
      title: 'Prepare the quarterly presentation',
      description: null,
      status: TaskStatus.PENDING,
      user,
    } as Task;
    usersRepository.findOneBy.mockResolvedValue(user);
    tasksRepository.create.mockReturnValue(task);
    tasksRepository.save.mockImplementation(async (savedTask) => savedTask);

    const result = await service.create({
      title: ' Prepare the quarterly presentation ',
      userId: 7,
    } as CreateTaskDto);

    expect(usersRepository.findOneBy).toHaveBeenCalledWith({ id: 7 });
    expect(tasksRepository.create).toHaveBeenCalledWith({
      title: 'Prepare the quarterly presentation',
      description: null,
      status: TaskStatus.PENDING,
      user,
    });
    expect(task.user).toBe(user);
    expect(tasksRepository.save).toHaveBeenCalledWith(task);
    expect(result).toBe(task);
  });

  it('rejects assignment when the user does not exist', async () => {
    usersRepository.findOneBy.mockResolvedValue(null);
    tasksRepository.create.mockReturnValue({ title: 'Task' });

    await expect(
      service.create({ title: 'Task', userId: 99 } as CreateTaskDto),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(tasksRepository.save).not.toHaveBeenCalled();
  });

  it('reassigns an existing task to another user', async () => {
    const user = { id: 2, username: 'john', name: 'John' } as User;
    const task = { id: 3, user: { id: 1 } } as Task;
    tasksRepository.findOne.mockResolvedValue(task);
    usersRepository.findOneBy.mockResolvedValue(user);
    tasksRepository.save.mockResolvedValue(task);

    const result = await service.assignTaskToUser(3, 2);

    expect(tasksRepository.findOne).toHaveBeenCalledWith({
      where: { id: 3 },
      relations: { user: true },
    });
    expect(usersRepository.findOneBy).toHaveBeenCalledWith({ id: 2 });
    expect(task.user).toBe(user);
    expect(tasksRepository.save).toHaveBeenCalledWith(task);
    expect(result).toBe(task);
  });

  it('rejects assignment when the task does not exist', async () => {
    tasksRepository.findOne.mockResolvedValue(null);

    await expect(service.assignTaskToUser(99, 2)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(usersRepository.findOneBy).not.toHaveBeenCalled();
    expect(tasksRepository.save).not.toHaveBeenCalled();
  });
});
