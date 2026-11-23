import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Patch,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { TasksService } from './tasks.service.js';
import { AssignTaskDto } from './dto/assign-task.dto.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { CreateTaskResponseDto } from './dto/create-task-response.dto.js';
import { FindTasksQueryDto } from './dto/find-tasks-query.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto.js';

@Controller('tasks')
@ApiTags('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description: 'Valid credentials. Returns the public user data.',
    schema: {
      example: {
        id: 1,
        username: 'maria',
        name: 'Maria',
        createdAt: '2026-11-23T16:00:00.000Z',
        updatedAt: '2026-11-23T16:00:00.000Z',
      },
    },
  })
  @ApiBadRequestResponse({
    description:
      'The request body does not contain a valid username and password.',
  })
  @ApiUnauthorizedResponse({ description: 'Invalid username or password.' })
  login(@Body() loginDto: LoginDto) {
    return this.tasksService.login(loginDto);
  }

  @Get('users')
  @ApiOperation({ summary: 'List users for task assignment and filtering' })
  @ApiOkResponse({
    description: 'Available users. Passwords are not included.',
    schema: {
      example: [
        { id: 1, username: 'maria', name: 'Maria' },
        { id: 2, username: 'john', name: 'John' },
      ],
    },
  })
  findUsers() {
    return this.tasksService.findUsers();
  }

  @Get()
  @ApiOperation({ summary: 'List tasks, optionally filtered by user' })
  @ApiQuery({
    name: 'userId',
    required: false,
    type: Number,
    description: 'Filter tasks by assigned user ID',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Tasks with public details of the assigned user.',
    schema: {
      example: [
        {
          id: 1,
          title: 'Prepare the quarterly presentation',
          description: 'Collect the latest quarterly figures',
          status: 'pending',
          createdAt: '2026-11-23T16:00:00.000Z',
          updatedAt: '2026-11-23T16:00:00.000Z',
          user: { id: 1, username: 'maria', name: 'Maria' },
        },
      ],
    },
  })
  @ApiBadRequestResponse({ description: 'userId must be a positive integer.' })
  findAll(@Query() query: FindTasksQueryDto) {
    return this.tasksService.findAll(query.userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create an unassigned task' })
  @ApiBody({ type: CreateTaskDto })
  @ApiCreatedResponse({
    description: 'Task created with an initial pending status.',
    type: CreateTaskResponseDto,
  })
  @ApiBadRequestResponse({ description: 'The submitted data is invalid.' })
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @Patch(':id/assign')
  @ApiOperation({ summary: 'Assign a task to a user' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Task ID',
    example: 3,
  })
  @ApiBody({ type: AssignTaskDto })
  @ApiOkResponse({
    description: 'Task assigned to the selected user.',
    schema: {
      example: {
        id: 3,
        title: 'Prepare the quarterly presentation',
        description: 'Collect the latest quarterly figures',
        status: 'pending',
        createdAt: '2026-11-23T16:00:00.000Z',
        updatedAt: '2026-11-23T16:30:00.000Z',
        user: { id: 2, username: 'john', name: 'John' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Task ID or userId is invalid.' })
  @ApiNotFoundResponse({ description: 'Task or assigned user was not found.' })
  assignTaskToUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() assignTaskDto: AssignTaskDto,
  ) {
    return this.tasksService.assignTaskToUser(id, assignTaskDto.userId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update a task status' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Task ID',
    example: 1,
  })
  @ApiBody({ type: UpdateTaskStatusDto })
  @ApiOkResponse({
    description: 'Task updated.',
    schema: {
      example: {
        id: 1,
        title: 'Prepare the quarterly presentation',
        description: 'Collect the latest quarterly figures',
        status: 'complete',
        createdAt: '2026-11-23T16:00:00.000Z',
        updatedAt: '2026-11-23T16:30:00.000Z',
        user: { id: 1, username: 'maria', name: 'Maria' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'The task ID or status is invalid.' })
  @ApiNotFoundResponse({ description: 'Task not found.' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskStatusDto: UpdateTaskStatusDto,
  ) {
    return this.tasksService.updateStatus(id, updateTaskStatusDto);
  }
}
