import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { File, FileDocument } from '../entities/file.entity';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { NotificationType } from '../../notifications/schemas/notification.schema';

@Injectable()
export class FilesService {
  constructor(
    @InjectModel(File.name) private fileModel: Model<FileDocument>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async uploadFile(
    file: Express.Multer.File,
    projectId: string,
    user: any,
  ): Promise<File> {
    const fileDoc = new this.fileModel({
      fileName: file.originalname,
      fileType: file.mimetype,
      fileSize: file.size,
      fileUrl: file.path,
      publicId: `collabhub/${Date.now()}-${file.originalname}`,
      uploadedBy: new Types.ObjectId(user.userId),
      projectId: new Types.ObjectId(projectId),
    });

    const createdFile = await fileDoc.save();

    await this.notificationsService.create({
      type: NotificationType.FILE_SHARED,
      message: `New file uploaded: ${file.originalname}`,
      userId: user.userId,
      entityId:
        (createdFile as any)._id?.toString() || createdFile.id?.toString(),
      entityType: 'File',
    });

    return createdFile;
  }

  async findAll(projectId?: string): Promise<File[]> {
    const query = projectId ? { projectId: new Types.ObjectId(projectId) } : {};
    return this.fileModel
      .find(query)
      .populate('uploadedBy', 'firstName lastName email')
      .exec();
  }

  async findOne(id: string): Promise<File> {
    const file = await this.fileModel
      .findById(id)
      .populate('uploadedBy', 'firstName lastName email')
      .exec();

    if (!file) {
      throw new NotFoundException('File not found');
    }
    return file;
  }

  async remove(id: string): Promise<void> {
    const file = await this.fileModel.findById(id);
    if (!file) {
      throw new NotFoundException('File not found');
    }

    try {
      const publicId =
        file.publicId ||
        file.fileUrl.split('/').slice(-2).join('/').split('.')[0];

      await cloudinary.uploader.destroy(publicId);

      await this.fileModel.findByIdAndDelete(id);
    } catch (error) {
      console.error('File deletion error:', error);
      throw new BadRequestException('File deletion failed');
    }
  }
}
