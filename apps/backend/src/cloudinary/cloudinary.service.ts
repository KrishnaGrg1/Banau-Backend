import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';
import { CloudinaryResponse } from './cloudinary-reponse';

@Injectable()
export class CloudinaryService {
  async uploadFile(
    file: Express.Multer.File,
    folder: string,
    publicId?: string,
  ): Promise<CloudinaryResponse> {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: publicId,
          overwrite: true,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result)
            return reject(new Error('No result returned from Cloudinary'));
          resolve(result as CloudinaryResponse);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
}
