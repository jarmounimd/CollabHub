import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message } from '../schemas/message.schema';
import { CreateMessageDto } from '../dto/create-message.dto';

interface CreateMessageData {
  messageText: string;
  projectId: Types.ObjectId;
  senderId: Types.ObjectId;
}

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
  ) {}

  async create(messageData: CreateMessageData) {
    const message = new this.messageModel(messageData);
    return message.save();
  }

  async findAllByProject(projectId: string) {
    return this.messageModel
      .find({ projectId: new Types.ObjectId(projectId) })
      .populate('senderId', 'firstName lastName email')
      .sort({ createdAt: 1 })
      .exec();
  }

  async findOne(id: string) {
    return this.messageModel
      .findById(id)
      .populate('senderId', 'name email')
      .exec();
  }

  async remove(id: string, userId: string) {
    const message = await this.messageModel.findById(id);

    if (!message) {
      return null;
    }

    // Check if user is the sender
    if (message.senderId.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    return this.messageModel.findByIdAndDelete(id);
  }
}
