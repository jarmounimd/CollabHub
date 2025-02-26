import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task, TaskDocument } from '../entities/task.entity';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
  ) {}

  async create(createTaskDto: CreateTaskDto, user: any): Promise<Task> {
    try {
      console.log('Received user data:', user);

      // Check for either _id or userId
      const userId = user._id || user.userId;
      if (!userId) {
        throw new BadRequestException('Invalid user data');
      }

      const taskData = {
        ...createTaskDto,
        createdBy: new Types.ObjectId(userId),
        projectId: new Types.ObjectId(createTaskDto.projectId),
        assignedTo: createTaskDto.assignedTo 
          ? new Types.ObjectId(createTaskDto.assignedTo) 
          : null,
      };

      console.log('Task data before save:', taskData);

      const task = new this.taskModel(taskData);
      const savedTask = await task.save();
      
      return await savedTask.populate([
        { path: 'assignedTo', select: 'firstName lastName email' },
        { path: 'createdBy', select: 'firstName lastName email' }
      ]);
    } catch (error) {
      console.error('Task creation error:', error);
      if (error.name === 'ValidationError') {
        throw new BadRequestException(`Validation error: ${error.message}`);
      }
      throw error;
    }
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

  async remove(id: string): Promise<void> {
    const result = await this.taskModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Task not found');
    }
  }
}