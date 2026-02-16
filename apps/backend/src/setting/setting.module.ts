import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';
import { AuthServices } from 'src/auth/auth.service';
import { EmailModule } from 'src/email/email.module';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [ConfigModule, AuthModule, EmailModule],
  providers: [PrismaService, AuthServices],
})
export class SettingModule {}
