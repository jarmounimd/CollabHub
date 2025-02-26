import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/entities/user.entity';

export enum TaskStatus {
  TODO = 'To Do',
  IN_PROGRESS = 'In Progress',
  DONE = 'Done'
}

export type TaskDocument = Task & Document;

@Schema({ timestamps: true })
export class Task {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ 
    type: String, 
    enum: TaskStatus, 
    default: TaskStatus.TODO 
  })
  status: TaskStatus;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assignedTo: User;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: User;

  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  projectId: Types.ObjectId;

  @Prop()
  dueDate: Date;
}

export const TaskSchema = SchemaFactory.createForClass(Task);