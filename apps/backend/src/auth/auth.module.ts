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
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'your-secret-key',
        signOptions: {
          // Cast the value to ensure TS recognizes it as a valid duration string
          expiresIn: (configService.get<string>('JWT_EXPIRES_IN') ||
            '7d') as any,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthServices, PrismaService,EmailService],
  exports: [JwtModule],
})
export class AuthModule {}
