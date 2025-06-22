import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/entities/user.entity';

export type GroupDocument = Group & Document;

@Schema({ timestamps: true })
export class Group {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId | User;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  members: (Types.ObjectId | User)[];
}

export const GroupSchema = SchemaFactory.createForClass(Group);