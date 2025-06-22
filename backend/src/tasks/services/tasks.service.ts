import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task, TaskDocument } from '../entities/task.entity';
import { Project } from '../../projects/entities/project.entity';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { NotificationType } from '../../notifications/schemas/notification.schema';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    @InjectModel(Project.name) private projectModel: Model<Project>,
    private readonly notificationsService: NotificationsService,
  ) {}

  // CREATE
  async create(createTaskDto: CreateTaskDto, userId: string) {
    const project = await this.projectModel.findById(createTaskDto.projectId);
    if (!project) throw new NotFoundException('Project not found');

    // Create task with proper ObjectId conversion
    const task = await this.taskModel.create({
      ...createTaskDto,
      createdBy: new Types.ObjectId(userId),
      projectId: new Types.ObjectId(createTaskDto.projectId),
      assignedTo: createTaskDto.assignedTo
        ? new Types.ObjectId(createTaskDto.assignedTo)
        : null, // Use null instead of undefined
    });

    // Populate fields
    const populated = await this.taskModel
      .findById(task._id)
      .populate('createdBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')
      .populate('projectId', 'name description')
      .exec();

    // Notification if assigned
    if (createTaskDto.assignedTo) {
      await this.notificationsService.create({
        type: NotificationType.TASK_ASSIGNED,
        message: `You have been assigned to task: ${task.title}`,
        userId: createTaskDto.assignedTo,
        entityId: String(task._id),
        entityType: 'Task',
      });
    }

    return populated;
  }

  // GET ALL (with filters)
  async findAll(
    userId: string,
    filters?: { projectId?: string; assignedTo?: string; createdBy?: string },
  ) {
    const query: any = {
      $or: [
        { createdBy: new Types.ObjectId(userId) },
        { assignedTo: new Types.ObjectId(userId) },
      ],
    };
    if (filters?.projectId)
      query.projectId = new Types.ObjectId(filters.projectId);
    if (filters?.assignedTo)
      query.assignedTo = new Types.ObjectId(filters.assignedTo);
    if (filters?.createdBy)
      query.createdBy = new Types.ObjectId(filters.createdBy);

    const tasks = await this.taskModel
      .find(query)
      .populate('createdBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')
      .populate('projectId', 'name description')
      .sort({ createdAt: -1 })
      .lean();

    return tasks;
  }

  // GET BY PROJECT
  async findTasksByProject(projectId: string) {
    const tasks = await this.taskModel
      .find({ projectId: new Types.ObjectId(projectId) })
      .populate('createdBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')
      .populate('projectId', 'name description')
      .sort({ createdAt: -1 })
      .lean();
    return tasks;
  }

  // GET ONE
  async findOne(id: string) {
    const task = await this.taskModel
      .findById(id)
      .populate('createdBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')
      .populate('projectId', 'name description')
      .exec(); // Add exec() to ensure proper execution

    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  // UPDATE
  async update(id: string, updateTaskDto: UpdateTaskDto) {
    if (updateTaskDto.projectId) {
      const project = await this.projectModel.findById(updateTaskDto.projectId);
      if (!project) throw new NotFoundException('Project not found');
    }

    const updateData = {
      ...updateTaskDto,
      projectId: updateTaskDto.projectId
        ? new Types.ObjectId(updateTaskDto.projectId)
        : undefined,
      assignedTo: updateTaskDto.assignedTo
        ? new Types.ObjectId(updateTaskDto.assignedTo)
        : undefined,
    };

    const updatedTask = await this.taskModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('createdBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')
      .populate('projectId', 'name description')
      .lean();

    if (!updatedTask) throw new NotFoundException('Task not found');

    if (updateTaskDto.assignedTo) {
      await this.notificationsService.create({
        type: NotificationType.TASK_ASSIGNED,
        message: `You have been assigned to task: ${updatedTask.title}`,
        userId: updateTaskDto.assignedTo,
        entityId: id,
        entityType: 'Task',
      });
    }

    return updatedTask;
  }

  // UPDATE STATUS
  async updateStatus(id: string, status: string) {
    const updatedTask = await this.taskModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .populate('createdBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')
      .populate('projectId', 'name description')
      .lean();
    if (!updatedTask) throw new NotFoundException('Task not found');
    return updatedTask;
  }

  // DELETE
  async remove(id: string) {
    const result = await this.taskModel.deleteOne({ _id: id });
    if (result.deletedCount === 0)
      throw new NotFoundException('Task not found');
  }

  // TASK STATS
  async findTaskStats(projectId: string) {
    const tasks = await this.taskModel
      .find({ projectId: new Types.ObjectId(projectId) })
      .select('status')
      .lean();

    return {
      total: tasks.length,
      todo: tasks.filter((task) => task.status === 'To Do').length,
      inProgress: tasks.filter((task) => task.status === 'In Progress').length,
      done: tasks.filter((task) => task.status === 'Done').length,
    };
  }

  // Returns all tasks the user is involved in, with optional filters
  async findUserAccessibleTasks(
    userId: string,
    filters?: { projectId?: string; assignedTo?: string; createdBy?: string },
  ) {
    console.log('[TasksService] findUserAccessibleTasks called with:', {
      userId,
      filters,
    });

    const query: any = {
      $or: [
        { createdBy: new Types.ObjectId(userId) },
        { assignedTo: new Types.ObjectId(userId) },
      ],
    };
    if (filters?.projectId)
      query.projectId = new Types.ObjectId(filters.projectId);
    if (filters?.assignedTo)
      query.assignedTo = new Types.ObjectId(filters.assignedTo);
    if (filters?.createdBy)
      query.createdBy = new Types.ObjectId(filters.createdBy);

    console.log('[TasksService] MongoDB query:', query);

    const tasks = await this.taskModel
      .find(query)
      .populate('createdBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')
      .populate('projectId', 'name description')
      .sort({ createdAt: -1 })
      .lean();

    console.log('[TasksService] Retrieved tasks:', tasks);

    return tasks;
  }

  // Returns tasks for a user, filtered by type ('assigned' or 'created')
  async findUserTasks(
    userId: string,
    type: 'assigned' | 'created' = 'assigned',
  ) {
    const query =
      type === 'assigned'
        ? { assignedTo: new Types.ObjectId(userId) }
        : { createdBy: new Types.ObjectId(userId) };

    return this.taskModel
      .find(query)
      .populate('createdBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')
      .populate('projectId', 'name description')
      .sort({ createdAt: -1 })
      .lean();
  }
}