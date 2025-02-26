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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from '../services/files.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ParseMongoIdPipe } from '../../common/pipes/parse-mongo-id.pipe';
import { CloudinaryConfigService } from '../config/cloudinary.config';
import * as fs from 'fs';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly cloudinaryConfig: CloudinaryConfigService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('projectId', ParseMongoIdPipe) projectId: string,
    @Request() req,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
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