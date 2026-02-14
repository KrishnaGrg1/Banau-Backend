import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';
import { AuthServices } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AdminController } from './admin.controller';
import { AdminServices } from './admin.services';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [ConfigModule, AuthModule, EmailModule],
  controllers: [AdminController],
  providers: [PrismaService, AuthServices, AdminServices],
})
export class AdminModule {}
