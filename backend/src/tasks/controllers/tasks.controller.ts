import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TasksService } from '../services/tasks.service';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ParseMongoIdPipe } from '../../common/pipes/parse-mongo-id.pipe';

@ApiTags('tasks')
@ApiBearerAuth()
@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'Task created successfully.' })
  async create(@Body() createTaskDto: CreateTaskDto, @Request() req) {
    return this.tasksService.create(createTaskDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get tasks with filters' })
  async findAll(
    @Request() req,
    @Query('projectId') projectId?: string,
    @Query('assignedTo') assignedTo?: string,
    @Query('createdBy') createdBy?: string,
  ) {
    // User should only see tasks they have access to
    const userId = req.user.userId;
    return this.tasksService.findUserAccessibleTasks(userId, {
      projectId,
      assignedTo,
      createdBy,
    });
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get all tasks for a specific project' })
  findProjectTasks(@Param('projectId', ParseMongoIdPipe) projectId: string) {
    return this.tasksService.findTasksByProject(projectId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get tasks for a specific user' })
  findUserTasks(
    @Param('userId', ParseMongoIdPipe) userId: string,
    @Query('type') type: 'assigned' | 'created' = 'assigned',
  ) {
    return this.tasksService.findUserTasks(userId, type);
  }

  @Get('project/:projectId/stats')
  @ApiOperation({ summary: 'Get task statistics for a project' })
  getProjectTaskStats(@Param('projectId', ParseMongoIdPipe) projectId: string) {
    return this.tasksService.findTaskStats(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a task by id' })
  findOne(@Param('id', ParseMongoIdPipe) id: string) {
    return this.tasksService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a task' })
  update(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update task status' })
  @ApiResponse({ status: 200, description: 'Task status updated successfully' })
  async updateStatus(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body('status') status: string,
  ) {
    console.log(`Updating task ${id} status to: ${status}`);
    return this.tasksService.updateStatus(id, status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task' })
  remove(@Param('id', ParseMongoIdPipe) id: string) {
    return this.tasksService.remove(id);
  }
}
