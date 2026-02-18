import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
  private readonly MAX_SIZE = 10 * 1024 * 1024; // 10MB

  transform(
    value: { logo?: Express.Multer.File[]; favicon?: Express.Multer.File[] },
    metadata: ArgumentMetadata,
  ) {
    if (!value) return value;

    const files = Object.values(value).flat();

    for (const file of files) {
      if (file.size > this.MAX_SIZE) {
        throw new BadRequestException(
          `File ${file.originalname} exceeds 10MB limit`,
        );
      }
    }

    return value; // IMPORTANT: return original value
  }
}
