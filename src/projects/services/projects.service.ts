import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project, ProjectDocument } from '../entities/project.entity';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
  ) {}

  async create(
    createProjectDto: CreateProjectDto,
    user: any,
  ): Promise<Project> {
    try {
      const project = new this.projectModel({
        ...createProjectDto,
        createdBy: new Types.ObjectId(user.userId),
        groupId: new Types.ObjectId(createProjectDto.groupId),
      });
      return await project.save();
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll(groupId?: string): Promise<Project[]> {
    const query = groupId ? { groupId: new Types.ObjectId(groupId) } : {};
    return this.projectModel
      .find(query)
      .populate('createdBy', 'firstName lastName email')
      .populate('groupId', 'name description')
      .exec();
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectModel
      .findById(id)
      .populate('createdBy', 'firstName lastName email')
      .populate('groupId', 'name description')
      .exec();

    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
  ): Promise<Project> {
    const updateData: any = { ...updateProjectDto };
    if (updateProjectDto.groupId) {
      updateData.groupId = new Types.ObjectId(updateProjectDto.groupId);
    }

    const project = await this.projectModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  async remove(id: string): Promise<void> {
    const result = await this.projectModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Project not found');
    }
  }
}
