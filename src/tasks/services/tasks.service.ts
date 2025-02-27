import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task, TaskDocument } from '../entities/task.entity';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { User } from '../../users/entities/user.entity';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { NotificationType } from '../../notifications/schemas/notification.schema';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: string): Promise<Task> {
    const task = await this.taskModel.create({
      ...createTaskDto,
      createdBy: new Types.ObjectId(userId),
    });

    if (createTaskDto.assignedTo) {
      await this.notificationsService.create({
        type: NotificationType.TASK_ASSIGNED,
        message: `You have been assigned to task: ${task.title}`,
        userId: createTaskDto.assignedTo.toString(),
        entityId: (task as any)._id?.toString() || task.id?.toString(),
        entityType: 'Task',
      });
    }

    return task;
  }

  async findAll(projectId?: string): Promise<Task[]> {
    const query = projectId ? { projectId: new Types.ObjectId(projectId) } : {};
    return this.taskModel
      .find(query)
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .exec();
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.taskModel
      .findById(id)
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .exec();

    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const updateData: any = { ...updateTaskDto };

    if (updateTaskDto.projectId) {
      updateData.projectId = new Types.ObjectId(updateTaskDto.projectId);
    }

    if (updateTaskDto.assignedTo) {
      updateData.assignedTo = new Types.ObjectId(updateTaskDto.assignedTo);
    }

    const task = await this.taskModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  async updateStatus(id: string, status: string): Promise<Task> {
    const task = await this.taskModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .populate('assignedTo');

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Add notification for assigned user
    if (task.assignedTo) {
      await this.notificationsService.create({
        type: NotificationType.TASK_UPDATED,
        message: `Task "${task.title}" status changed to ${status}`,
        userId: task.assignedTo._id.toString(),
        entityId: (task as any)._id?.toString() || task.id?.toString(),
        entityType: 'Task',
      });
    }

    return task;
  }

  async remove(id: string): Promise<void> {
    const result = await this.taskModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Task not found');
    }
  }
}
