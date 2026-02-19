import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { EmailModule } from 'src/email/email.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { PublicProductController } from './public-products.controller';
import { PublicProductService } from './public-products.service';

@Module({
  imports: [ConfigModule, EmailModule, CloudinaryModule],
  controllers: [PublicProductController],
  providers: [PrismaService, PublicProductService],
})
export class PublicProductsModule {}
