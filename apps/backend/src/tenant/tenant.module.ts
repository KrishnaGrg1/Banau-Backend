import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TenantService } from './tenant.service';
import { TenantController } from './tenant.controller';
import { AuthModule } from 'src/auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [AuthModule, ConfigModule],
  controllers: [TenantController],
  providers: [TenantService, PrismaService],
})
export class TenantModule {}
