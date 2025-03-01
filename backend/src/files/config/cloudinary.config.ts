import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class CloudinaryConfigService {
  private readonly logger = new Logger(CloudinaryConfigService.name);
  private readonly storage: CloudinaryStorage;

  constructor() {
    this.logger.log('Initializing CloudinaryStorage');

    cloudinary.config({
      cloud_name: 'dwfy3lilr',
      api_key: '672878883935546',
      api_secret: 'xEBSun_oV3HQ1iqbU068YdnIV4A',
    });

    this.storage = new CloudinaryStorage({
      cloudinary,
      params: {
        folder: 'collabhub',
        allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
        resource_type: 'auto',
      } as any,
    });
  }

  getStorage(): CloudinaryStorage {
    if (!this.storage) {
      throw new Error('CloudinaryStorage not initialized');
    }
    return this.storage;
  }
}
