import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthServices } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { EmailService } from 'src/email/email.service';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    EmailModule,
    // Register the JwtModule so JwtService becomes available
    JwtModule,
  ],
  controllers: [AuthController],
  providers: [AuthServices, PrismaService, EmailService],
  exports: [JwtModule, AuthServices],
})
export class AuthModule {}
