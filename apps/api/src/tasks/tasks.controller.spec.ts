import { ValidationPipe } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { TasksService } from './tasks.service.js';
import { TasksController } from './tasks.controller.js';

describe('TasksController', () => {
  let app: INestApplication;
  const tasksService = {
    login: vi.fn(),
    findUsers: vi.fn(),
    findAll: vi.fn(),
    create: vi.fn(),
    assignTaskToUser: vi.fn(),
    updateStatus: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    tasksService.findAll.mockResolvedValue([]);

    const moduleRef = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [{ provide: TasksService, useValue: tasksService }],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('transforms the userId query parameter to a number and passes it to the service', async () => {
    await request(app.getHttpServer()).get('/tasks?userId=7').expect(200);

    expect(tasksService.findAll).toHaveBeenCalledWith(7);
  });

  it('rejects a non-integer userId query parameter', async () => {
    await request(app.getHttpServer()).get('/tasks?userId=abc').expect(400);

    expect(tasksService.findAll).not.toHaveBeenCalled();
  });

  it('assigns a task to the user in the request body', async () => {
    tasksService.assignTaskToUser.mockResolvedValue({ id: 3, user: { id: 2 } });

    await request(app.getHttpServer())
      .patch('/tasks/3/assign')
      .send({ userId: 2 })
      .expect(200);

    expect(tasksService.assignTaskToUser).toHaveBeenCalledWith(3, 2);
  });
});
