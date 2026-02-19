import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { EmailModule } from 'src/email/email.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductController } from './products.controller';
import { ProductServices } from './products.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [ConfigModule, AuthModule, EmailModule, CloudinaryModule],
  controllers: [ProductController],
  providers: [PrismaService, ProductServices],
})
export class ProductsModule {}
