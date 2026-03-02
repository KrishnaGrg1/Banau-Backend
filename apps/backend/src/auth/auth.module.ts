import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthServices } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { EmailService } from 'src/email/email.service';
import { EmailModule } from 'src/email/email.module';
import { UserController } from 'src/user/user.controller';
import { UserServices } from 'src/user/user.service';

@Module({
  imports: [PrismaModule, ConfigModule, EmailModule, JwtModule],
  controllers: [AuthController, UserController],
  providers: [AuthServices, UserServices, PrismaService, EmailService],
  exports: [JwtModule, AuthServices],
})
export class AuthModule {}
