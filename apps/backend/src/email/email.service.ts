import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly resend: Resend;
  private readonly fromEmail: string;
  private readonly frontendUrl: string;
  constructor(private readonly configService: ConfigService) {
    // Initialize once to save resources
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.resend = new Resend(apiKey);
    this.fromEmail = this.configService.get<string>('RESEND_EMAIL_FROM') || '';
    const isProd = this.configService.get<string>('NODE_ENV') === 'production';

    this.frontendUrl = isProd
      ? this.configService.get<string>('FRONTEND_URL_PROD')!
      : this.configService.get<string>('FRONTEND_URL')!;
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

  async sendVerificationEmail(
    to: string,
    username: string,
    token: string,
    userId: string | number,
  ): Promise<any> {
    const htmlMsg = html.call(this, {
      token,
      username,
      topic: EmailTopic.VerifyEmail,
      userId,
      baseUrl: this.frontendUrl,
    });
    return this.sendEmail(to, subject(EmailTopic.VerifyEmail), htmlMsg);
  }

  async sendPasswordResetEmail(
    to: string,
    username: string,
    token: string,
    userId: string | number,
  ): Promise<any> {
    const htmlMsg = html.call(this, {
      token,
      username,
      topic: EmailTopic.ForgotPassword,
      userId,
      baseUrl: this.frontendUrl,
    });
    return this.sendEmail(to, subject(EmailTopic.ForgotPassword), htmlMsg);
  }
}

export enum EmailTopic {
  ForgotPassword = 'FORGET_PASSWORD',
  VerifyEmail = 'EMAIL_VERIFICATION',
}

interface HtmlProps {
  token: string;
  username: string;
  topic: EmailTopic;
  userId?: string | number;
  baseUrl: string;
}

const message = (topic: EmailTopic): string => {
  switch (topic) {
    case EmailTopic.ForgotPassword:
      return 'You requested to reset your password. Use the button below or enter the token in the app to continue.';
    case EmailTopic.VerifyEmail:
      return 'Welcome! Please verify your email using the button below or enter the token in the app.';
    default:
      return '';
  }
};

const subject = (topic: EmailTopic): string => {
  switch (topic) {
    case EmailTopic.ForgotPassword:
      return '🔒 Reset Your Password';
    case EmailTopic.VerifyEmail:
      return '📩 Verify Your Email';
    default:
      return 'Notification';
  }
};

const actionButton = (
  topic: EmailTopic,
  token: string,
  baseUrl: string,
  userId?: string | number,
): string => {
  const href =
    topic === EmailTopic.ForgotPassword
      ? `${baseUrl}/reset-password?token=${token}&id=${userId}`
      : `${baseUrl}/verify?token=${token}&id=${userId}`;

  const label =
    topic === EmailTopic.ForgotPassword ? 'Reset Password' : 'Verify Email';

  return `
    <a href="${href}"
      style="
        display:inline-block;
        width:100%;
        max-width:280px;
        background:#4f46e5;
        color:#ffffff;
        text-decoration:none;
        font-size:16px;
        font-weight:600;
        padding:14px 24px;
        border-radius:10px;
        text-align:center;
      ">
      ${label}
    </a>
  `;
};

const html = function (
  this: EmailService,
  { token, topic, username, userId, baseUrl }: HtmlProps,
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject(topic)}</title>
</head>

<body style="margin:0; padding:0; background:#f4f6f8; font-family:Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background:#ffffff; border-radius:16px; overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="padding:28px; text-align:center; background:#4f46e5; color:#ffffff;">
              <h1 style="margin:0; font-size:22px;">${subject(topic)}</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:32px; color:#333; font-size:16px; line-height:1.6;">
              <p style="margin-top:0;">Hi <b>${username}</b>,</p>
              <p>${message(topic)}</p>

              <!-- CTA -->
              <div style="margin:32px 0; text-align:center;">
                ${actionButton(topic, token, baseUrl, userId)}
              </div>

              <!-- Token Box -->
              <div style="
                background:#f9fafb;
                border:1px dashed #c7d2fe;
                border-radius:12px;
                padding:20px;
                text-align:center;
                margin-top:24px;
              ">
                <p style="margin:0 0 8px; font-size:14px; color:#555;">
                  Or enter this token in the app:
                </p>
                <p style="
                  margin:0;
                  font-size:20px;
                  font-weight:700;
                  letter-spacing:2px;
                  color:#111;
                ">
                  ${token}
                </p>
              </div>

              <p style="margin-top:24px; font-size:14px; color:#777;">
                If you didn’t request this, you can safely ignore this email.
                <br />Never share your token with anyone.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px; text-align:center; font-size:13px; color:#999; background:#fafafa;">
              <p style="margin:0;">
                — The <b>Banau</b> Team
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};
