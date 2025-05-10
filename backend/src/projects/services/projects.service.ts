import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Document } from 'mongoose';
import { Project, ProjectDocument } from '../entities/project.entity';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { Group, GroupDocument } from '../../groups/entities/group.entity';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { NotificationType } from '../../notifications/schemas/notification.schema';
import { Task, TaskStatus } from '../../tasks/entities/task.entity';

export interface ProjectWithProgress extends Omit<Project, '_id'> {
  _id: Types.ObjectId;
  progress: number;
}

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
    @InjectModel(Task.name) private taskModel: Model<Task>,
    private notificationsService: NotificationsService,
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

  async findAll(groupId?: string): Promise<ProjectWithProgress[]> {
    const query = groupId ? { groupId: new Types.ObjectId(groupId) } : {};
    const projects = await this.projectModel
      .find(query)
      .populate('createdBy', 'firstName lastName email')
      .populate('groupId', 'name description')
      .exec();

    // Calculate progress for each project
    const projectsWithProgress = await Promise.all(
      projects.map(async (projectDoc) => {
        const project = projectDoc as ProjectDocument & { _id: Types.ObjectId };
        const projectId = project._id.toString();
        const progress = await this.calculateProjectProgress(projectId);
        const projectObj = project.toObject();
        return {
          ...projectObj,
          _id: project._id,
          progress,
        } as ProjectWithProgress;
      }),
    );

    return projectsWithProgress;
  }

  async findOne(id: string): Promise<ProjectWithProgress> {
    const projectDoc = await this.projectModel
      .findById(id)
      .populate('createdBy', 'firstName lastName email')
      .populate('groupId', 'name description')
      .exec();

    if (!projectDoc) {
      throw new NotFoundException('Project not found');
    }

    const project = projectDoc as ProjectDocument & { _id: Types.ObjectId };
    // Calculate progress
    const progress = await this.calculateProjectProgress(id);
    const projectObj = project.toObject();
    return {
      ...projectObj,
      _id: project._id,
      progress,
    } as ProjectWithProgress;
  }

  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
  ): Promise<Project> {
    console.log(`[ProjectsService] Updating project ${id}:`, updateProjectDto);

    // First get the existing project to get the groupId
    const existingProject = await this.projectModel
      .findById(id)
      .populate('groupId');

    if (!existingProject) {
      console.log(`[ProjectsService] Project ${id} not found`);
      throw new NotFoundException('Project not found');
    }

    // Update the project with the new groupId if provided
    const updatedProject = await this.projectModel
      .findByIdAndUpdate(
        id,
        {
          ...updateProjectDto,
          groupId: updateProjectDto.groupId
            ? new Types.ObjectId(updateProjectDto.groupId)
            : existingProject.groupId,
        },
        { new: true },
      )
      .populate('groupId');

    if (!updatedProject) {
      throw new NotFoundException('Project not found after update');
    }

    console.log(`[ProjectsService] Project updated:`, updatedProject);

    // Get group members and notify them using the updated project's groupId
    const group = await this.groupModel
      .findById(updatedProject.groupId)
      .populate('members');

    console.log(`[ProjectsService] Found group:`, {
      groupId: group?._id,
      memberCount: group?.members?.length || 0,
    });

    if (group && group.members) {
      for (const member of group.members) {
        console.log(
          `[ProjectsService] Sending notification to member:`,
          member._id,
        );
        try {
          await this.notificationsService.create({
            type: NotificationType.PROJECT_UPDATED,
            message: `Project "${updatedProject.name}" has been updated`,
            userId: member._id.toString(),
            entityId:
              (updatedProject as any)._id?.toString() ||
              updatedProject.id?.toString(),
            entityType: 'Project',
          });
          console.log(
            `[ProjectsService] Notification sent successfully to:`,
            member._id,
          );
        } catch (error) {
          console.error(
            `[ProjectsService] Failed to send notification:`,
            error,
          );
        }
      }
    }

    return updatedProject;
  }

  async remove(id: string): Promise<void> {
    const result = await this.projectModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Project not found');
    }
  }

  async calculateProjectProgress(projectId: string): Promise<number> {
    const tasks = await this.taskModel
      .find({ projectId: new Types.ObjectId(projectId) })
      .exec();

    if (tasks.length === 0) {
      return 0;
    }

    const completedTasks = tasks.filter(
      (task) => task.status === TaskStatus.DONE,
    ).length;
    return Math.round((completedTasks / tasks.length) * 100);
  }
}
