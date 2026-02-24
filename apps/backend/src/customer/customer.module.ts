import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { EmailModule } from 'src/email/email.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { CustomerController } from './customer.controller';
import { CustomerServices } from './customer.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [CloudinaryModule, ConfigModule,JwtModule, EmailModule],
  controllers: [CustomerController],
  providers: [PrismaService, CustomerServices],
})
export class CustomerModule {}
