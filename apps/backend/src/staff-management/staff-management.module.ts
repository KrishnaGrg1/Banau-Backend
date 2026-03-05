import { Module } from '@nestjs/common';
import { StaffManagementService } from './staff-management.service';
import { StaffManagementController } from './staff-management.controller';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { EmailModule } from 'src/email/email.module';
import { RedisModule } from 'src/redis/redis.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    ConfigModule,
    CloudinaryModule,
    EmailModule,
    RedisModule,
    PrismaModule,
    AuthModule,
  ],
  providers: [StaffManagementService],
  controllers: [StaffManagementController],
})
export class StaffManagementModule {}
