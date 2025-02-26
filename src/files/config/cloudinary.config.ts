import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CloudinaryConfigService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  getStorage() {
    return new CloudinaryStorage({
      cloudinary: cloudinary,
      params: async (req: Express.Request, file: Express.Multer.File) => {
        return {
          resource_type: 'auto',
          public_id: `collabhub/${Date.now()}-${file.originalname}`,
          transformation: [{ quality: 'auto' }],
        };
      },
    });
  }
}