import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';
import { AuthServices } from 'src/auth/auth.service';
import { CloudinaryProvider } from 'src/cloudinary/cloudinary.provider';
import { EmailModule } from 'src/email/email.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { SettingServices } from './setting.services';
import { TenantSettingController } from './setting.controller';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [ConfigModule, AuthModule, EmailModule, CloudinaryModule],
  controllers: [TenantSettingController],
  providers: [PrismaService, AuthServices, SettingServices],
})
export class SettingModule {}
