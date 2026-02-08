import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './email.service';

@Module({
  // We import ConfigModule here so EmailService can use ConfigService
  imports: [ConfigModule],
  providers: [EmailService],
  // Exporting it allows other modules (like AuthModule) to use EmailService
  exports: [EmailService],
})
export class EmailModule {}