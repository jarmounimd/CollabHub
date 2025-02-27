import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/entities/user.entity';
import { Group } from '../../groups/entities/group.entity';

export type ProjectDocument = Project & Document;

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Group', required: true })
  groupId: Group;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: User;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);