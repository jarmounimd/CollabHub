import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationType } from '../schemas/notification.schema';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { NotificationsGateway } from '../gateways/notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async create(createNotificationDto: {
    type: string;
    message: string;
    userId: string;
    entityId: string;
    entityType: string;
  }): Promise<Notification> {
    const notification = await this.notificationModel.create(
      createNotificationDto,
    );

    try {
      // Send notification through WebSocket if needed
      this.notificationsGateway.sendNotification(
        createNotificationDto.userId,
        notification,
      );
    } catch (error) {
      console.log('WebSocket notification failed:', error);
      // Continue even if WebSocket fails - notification is still saved in DB
    }

    return notification;
  }

  async findAllForUser(userId: string): Promise<Notification[]> {
    return this.notificationModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationModel
      .findOneAndUpdate(
        { _id: id, userId: new Types.ObjectId(userId) },
        { isRead: true },
        { new: true },
      )
      .exec();

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return notification;
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationModel
      .updateMany(
        { userId: new Types.ObjectId(userId), isRead: false },
        { isRead: true },
      )
      .exec();
  }

  async deleteOldNotifications(): Promise<void> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await this.notificationModel
      .deleteMany({
        createdAt: { $lt: thirtyDaysAgo },
        isRead: true,
      })
      .exec();
  }
}
