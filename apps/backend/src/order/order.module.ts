import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { EmailModule } from 'src/email/email.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrderController } from './order.controller';
import { OrderServices } from './order.service';

@Module({
  imports: [ConfigModule, EmailModule, CloudinaryModule],
  controllers: [OrderController],
  providers: [PrismaService, OrderServices],
})
export class OrderModule {}
