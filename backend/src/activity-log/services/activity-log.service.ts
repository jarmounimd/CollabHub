import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Activity, ActivityType } from '../schemas/activity.schema';

@Injectable()
export class ActivityLogService {
  constructor(
    @InjectModel(Activity.name) private activityModel: Model<Activity>
  ) {}

  async logActivity(data: {
    userId: string;
    projectId: string;
    type: ActivityType;
    action: string;
    details?: Record<string, any>;
  }): Promise<Activity> {
    const activity = await this.activityModel.create({
      userId: new Types.ObjectId(data.userId),
      projectId: new Types.ObjectId(data.projectId),
      type: data.type,
      action: data.action,
      details: data.details
    });

    return activity;
  }

  async getProjectActivities(projectId: string): Promise<Activity[]> {
    return this.activityModel
      .find({ projectId: new Types.ObjectId(projectId) })
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .exec();
  }
}