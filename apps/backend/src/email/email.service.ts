import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly resend: Resend;
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    // Initialize once to save resources
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.resend = new Resend(apiKey);
    this.fromEmail = this.configService.get<string>('RESEND_EMAIL_FROM') || '';
  }

  async sendEmail(to: string, subject: string, htmlMsg: string): Promise<any> {
    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: [to],
        subject: subject,
        html: htmlMsg,
      });

      if (error) {
        // NestJS way of throwing specific errors
        throw new InternalServerErrorException(error.message);
      }

      return data;
    } catch (error) {
      // Re-throw the error so your controller can handle it
      throw new InternalServerErrorException('Email service failure');
    }
  }
}