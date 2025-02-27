import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
  Request,
  BadRequestException,
  StreamableFile,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from '../services/files.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ParseMongoIdPipe } from '../../common/pipes/parse-mongo-id.pipe';
import { CloudinaryConfigService } from '../config/cloudinary.config';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import * as fs from 'fs';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { ParseFilePipeBuilder } from '@nestjs/common';
import { v2 } from 'cloudinary';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  private readonly logger = new Logger(FilesController.name);

  constructor(
    private readonly filesService: FilesService,
    private readonly cloudinaryConfig: CloudinaryConfigService,
  ) {
    this.logger.log('Initializing FilesController');
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: new CloudinaryStorage({
        cloudinary: v2,
        params: {
          folder: 'collabhub',
          allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
          resource_type: 'auto',
        } as any,
      }),
    }),
  )
  async uploadFile(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: 5 * 1024 * 1024 })
        .build(),
    )
    file: Express.Multer.File,
    @Query('projectId', ParseMongoIdPipe) projectId: string,
    @Request() req,
  ) {
    this.logger.debug(`Request received for file upload`);
    this.logger.debug(`ProjectId: ${projectId}`);
    this.logger.debug(`File: ${JSON.stringify(file)}`);
    return this.filesService.uploadFile(file, projectId, req.user);
  }

  @Post('test-upload')
  @UseInterceptors(FileInterceptor('file'))
  async testUpload(@UploadedFile() file: Express.Multer.File) {
    console.log('File received:', file);
    return { message: 'File upload test successful', file };
  }

  @Get('download/:id')
  async downloadFile(@Param('id', ParseMongoIdPipe) id: string) {
    const file = await this.filesService.findOne(id);
    // For Cloudinary URLs, we'll redirect to the file URL
    return { fileUrl: file.fileUrl };
  }

  @Get()
  findAll(@Query('projectId') projectId?: string) {
    return this.filesService.findAll(projectId);
  }

  @Get(':id')
  findOne(@Param('id', ParseMongoIdPipe) id: string) {
    return this.filesService.findOne(id);
  }

  @Delete(':id')
  async remove(@Param('id', ParseMongoIdPipe) id: string) {
    return this.filesService.remove(id);
  }
}
