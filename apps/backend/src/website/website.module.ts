import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { WebsiteService } from './webiste.service';
import { WebsiteController } from './website.controller';
import { AuthModule } from 'src/auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [AuthModule, ConfigModule],
  controllers: [WebsiteController],
  providers: [WebsiteService, PrismaService],
})
export class WebsiteModule {}
