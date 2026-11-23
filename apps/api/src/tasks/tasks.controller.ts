import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { TasksService } from './tasks.service.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';

@Controller('tasks')
@ApiTags('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description:
      'Credenciales válidas. Devuelve los datos públicos del usuario.',
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
    description: 'El body no tiene username y password válidos.',
  })
  @ApiUnauthorizedResponse({ description: 'Usuario o contraseña incorrectos.' })
  login(@Body() loginDto: LoginDto) {
    return this.tasksService.login(loginDto);
  }

  @Post()
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @Get()
  findAll() {
    return this.tasksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(+id, updateTaskDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tasksService.remove(+id);
  }
}
