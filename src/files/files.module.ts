import { Module, Logger } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FilesController } from './controllers/files.controller';
import { FilesService } from './services/files.service';
import { File, FileSchema } from './entities/file.entity';
import { CloudinaryConfigService } from './config/cloudinary.config';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: File.name, schema: FileSchema }]),
    NotificationsModule,
  ],
  controllers: [FilesController],
  providers: [
    FilesService,
    CloudinaryConfigService,
    {
      provide: Logger,
      useValue: new Logger('FilesModule'),
    },
  ],
  exports: [FilesService],
})
export class FilesModule {}
