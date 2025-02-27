import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum NotificationType {
  TASK_ASSIGNED = 'Task Assigned',
  TASK_UPDATED = 'Task Updated',
  FILE_SHARED = 'File Shared',
  NEW_MESSAGE = 'New Message',
  PROJECT_ADDED = 'Project Added',
  PROJECT_UPDATED = 'Project Updated',
  GROUP_INVITATION = 'Group Invitation',
}

@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: NotificationType })
  type: NotificationType;

  @Prop({ required: true })
  message: string;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ type: Types.ObjectId, refPath: 'entityType' })
  entityId: Types.ObjectId;

  @Prop({
    required: true,
    enum: ['Task', 'File', 'Message', 'Project', 'Group'],
  })
  entityType: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
