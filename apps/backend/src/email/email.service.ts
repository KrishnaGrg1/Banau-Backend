import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

// --- Enums ------------------------------------------------------------------

export enum EmailTopic {
  ForgotPassword = 'FORGET_PASSWORD',
  VerifyEmail = 'EMAIL_VERIFICATION',
}

// --- Template constants -----------------------------------------------------

const EMAIL_SUBJECTS: Record<EmailTopic, string> = {
  [EmailTopic.ForgotPassword]: 'Reset Your Password',
  [EmailTopic.VerifyEmail]: 'Verify Your Email',
};

const EMAIL_MESSAGES: Record<EmailTopic, string> = {
  [EmailTopic.ForgotPassword]:
    'You requested to reset your password. Use the button below or enter the token in the app to continue.',
  [EmailTopic.VerifyEmail]:
    'Welcome! Please verify your email using the button below or enter the token in the app.',
};

// --- Shared template helpers ------------------------------------------------

/** Wraps any body HTML in the shared email shell (outer table + header + footer). */
function emailShell(params: {
  headerColor: string;
  headerText: string;
  subheader?: string;
  body: string;
  footerLabel: string;
}): string {
  const { headerColor, headerText, subheader = '', body, footerLabel } = params;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:16px;overflow:hidden;">
        <tr>
          <td style="padding:28px;text-align:center;background:${headerColor};color:#fff;">
            <h1 style="margin:0;font-size:22px;">${headerText}</h1>
            ${subheader ? `<p style="margin:8px 0 0;opacity:.85;">${subheader}</p>` : ''}
          </td>
        </tr>
        <tr>
          <td style="padding:32px;color:#333;font-size:16px;line-height:1.6;">
            ${body}
          </td>
        </tr>
        <tr>
          <td style="padding:20px;text-align:center;font-size:13px;color:#999;background:#fafafa;">
            <p style="margin:0;">${footerLabel}</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

/** Renders a two-column table of order line items. */
function itemTableHtml(items: any[]): string {
  const rows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">${item.productName}${item.variantName ? ` &mdash; ${item.variantName}` : ''}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:center;">${item.quantity}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right;">$${Number(item.price).toFixed(2)}</td>
      </tr>`,
    )
    .join('');

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:20px;">
      <thead>
        <tr style="background:#f9fafb;">
          <th style="padding:10px 12px;text-align:left;font-size:14px;color:#555;">Item</th>
          <th style="padding:10px 12px;text-align:center;font-size:14px;color:#555;">Qty</th>
          <th style="padding:10px 12px;text-align:right;font-size:14px;color:#555;">Price</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

// --- Service ----------------------------------------------------------------

@Injectable()
export class EmailService {
  private readonly resend: Resend;
  private readonly fromEmail: string;
  private readonly frontendUrl: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.resend = new Resend(apiKey);
    this.fromEmail = this.configService.get<string>('RESEND_EMAIL_FROM') || '';
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL') || '';
  }

  // --- Core send ------------------------------------------------------------

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    const { error } = await this.resend.emails.send({
      from: this.fromEmail,
      to: [to],
      subject,
      html,
    });
    if (error) throw new InternalServerErrorException(error.message);
  }

  // --- Auth emails ----------------------------------------------------------

  async sendVerificationEmail(
    to: string,
    username: string,
    token: string,
    userId: string | number,
  ): Promise<void> {
    return this.sendEmail(
      to,
      EMAIL_SUBJECTS[EmailTopic.VerifyEmail],
      this.buildTokenEmail({
        topic: EmailTopic.VerifyEmail,
        username,
        token,
        userId,
      }),
    );
  }

  async sendPasswordResetEmail(
    to: string,
    username: string,
    token: string,
    userId: string | number,
  ): Promise<void> {
    return this.sendEmail(
      to,
      EMAIL_SUBJECTS[EmailTopic.ForgotPassword],
      this.buildTokenEmail({
        topic: EmailTopic.ForgotPassword,
        username,
        token,
        userId,
      }),
    );
  }

  // --- Order emails ---------------------------------------------------------

  async sendOrderConfirmationToCustomer(params: {
    order: any;
    customer: any;
    storeName: string;
    subdomain: string;
    isNewUser: boolean;
    tempPassword?: string;
  }): Promise<void> {
    const { order, customer, storeName, subdomain, isNewUser, tempPassword } =
      params;
    const loginUrl = `${this.frontendUrl}/s/${subdomain}/account/login`;
    const orderUrl = `${this.frontendUrl}/s/${subdomain}/orders/${order.id}`;
    const fullName = `${customer.firstName} ${customer.lastName}`;

    const accountBlock =
      isNewUser && tempPassword
        ? `<div style="background:#fefce8;border:1px solid #fde047;border-radius:10px;padding:20px;margin:24px 0;">
            <p style="margin:0 0 8px;font-weight:700;color:#854d0e;">Your account has been created!</p>
            <p style="margin:0 0 4px;color:#555;">You can now log in to track your orders.</p>
            <p style="margin:8px 0 4px;color:#555;"><b>Email:</b> ${customer.email}</p>
            <p style="margin:0 0 16px;color:#555;"><b>Temporary Password:</b>
              <code style="background:#f3f4f6;padding:2px 8px;border-radius:4px;font-size:15px;letter-spacing:1px;">${tempPassword}</code>
            </p>
            <a href="${loginUrl}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:10px 22px;border-radius:8px;font-weight:600;">Login to your account &rarr;</a>
            <p style="margin:12px 0 0;font-size:12px;color:#999;">Please change your password after logging in.</p>
          </div>`
        : `<p style="margin:16px 0;"><a href="${orderUrl}" style="color:#4f46e5;font-weight:600;">View your order &rarr;</a></p>`;

    const body = `
      <p style="margin-top:0;">Hi <b>${fullName}</b>,</p>
      <p>Thank you for your order! We've received it and it's being processed.</p>
      <p style="margin:0 0 4px;"><b>Order ID:</b> <code style="font-size:13px;">${order.id}</code></p>
      <p style="margin:0 0 20px;"><b>Total:</b> $${Number(order.total).toFixed(2)}</p>
      ${itemTableHtml(order.items ?? [])}
      ${accountBlock}`;

    return this.sendEmail(
      customer.email,
      `Order Confirmed - ${storeName}`,
      emailShell({
        headerColor: '#4f46e5',
        headerText: 'Order Confirmed',
        subheader: storeName,
        body,
        footerLabel: `&mdash; The <b>${storeName}</b> Team`,
      }),
    );
  }

  async sendNewOrderNotificationToOwner(params: {
    order: any;
    ownerEmail: string;
    storeName: string;
  }): Promise<void> {
    const { order, ownerEmail, storeName } = params;
    const dashboardUrl = `${this.frontendUrl}/dashboard/orders/${order.id}`;

    const body = `
      <p style="margin-top:0;">You have a new order on <b>${storeName}</b>!</p>
      <p style="margin:0 0 4px;"><b>Order ID:</b> <code style="font-size:13px;">${order.id}</code></p>
      <p style="margin:0 0 4px;"><b>Customer:</b> ${order.ShippingfirstName ?? ''} ${order.ShippinglastName ?? ''} (${order.ShippingEmail ?? ''})</p>
      <p style="margin:0 0 20px;"><b>Total:</b> $${Number(order.total).toFixed(2)}</p>
      ${itemTableHtml(order.items ?? [])}
      <div style="text-align:center;">
        <a href="${dashboardUrl}" style="display:inline-block;background:#16a34a;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;">View Order in Dashboard &rarr;</a>
      </div>`;

    return this.sendEmail(
      ownerEmail,
      `New Order on ${storeName} - $${Number(order.total).toFixed(2)}`,
      emailShell({
        headerColor: '#16a34a',
        headerText: 'New Order Received',
        subheader: storeName,
        body,
        footerLabel: '&mdash; The <b>Banau</b> Platform',
      }),
    );
  }

  // --- Customer emails ------------------------------------------------------

  async sendCustomerWelcomeEmail(params: {
    to: string;
    firstName: string;
    lastName: string;
    tempPassword: string;
    subdomain: string;
  }): Promise<void> {
    const { to, firstName, lastName, tempPassword, subdomain } = params;
    const fullName = `${firstName} ${lastName}`;
    const loginUrl = `${this.frontendUrl}/s/${subdomain}/account/login`;

    const body = `
      <p style="margin-top:0;">Hi <b>${fullName}</b>,</p>
      <p>Welcome! An account has been created for you. Use the credentials below to log in and manage your orders.</p>
      <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:10px;padding:20px;margin:24px 0;">
        <p style="margin:0 0 8px;font-weight:700;color:#15803d;">Your Login Details</p>
        <p style="margin:4px 0;"><b>Email:</b> ${to}</p>
        <p style="margin:4px 0 16px;"><b>Temporary Password:</b>
          <code style="background:#f3f4f6;padding:2px 10px;border-radius:4px;font-size:15px;letter-spacing:1px;">${tempPassword}</code>
        </p>
        <a href="${loginUrl}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:10px 22px;border-radius:8px;font-weight:600;">Login to your account &rarr;</a>
      </div>
      <p style="margin:0;font-size:13px;color:#888;">For your security, please change your password after your first login. Never share your credentials with anyone.</p>`;

    return this.sendEmail(
      to,
      'Welcome – Your Account Details',
      emailShell({
        headerColor: '#4f46e5',
        headerText: 'Welcome!',
        subheader: 'Your account is ready',
        body,
        footerLabel: '&mdash; The <b>Banau</b> Team',
      }),
    );
  }

  // --- Private template builder ---------------------------------------------

  private buildTokenEmail(params: {
    topic: EmailTopic;
    username: string;
    token: string;
    userId: string | number;
  }): string {
    const { topic, username, token, userId } = params;
    const isReset = topic === EmailTopic.ForgotPassword;
    const actionUrl = isReset
      ? `${this.frontendUrl}/reset-password?token=${token}&id=${userId}`
      : `${this.frontendUrl}/verify?token=${token}&id=${userId}`;
    const actionLabel = isReset ? 'Reset Password' : 'Verify Email';

    const body = `
      <p style="margin-top:0;">Hi <b>${username}</b>,</p>
      <p>${EMAIL_MESSAGES[topic]}</p>
      <div style="margin:32px 0;text-align:center;">
        <a href="${actionUrl}" style="display:inline-block;width:100%;max-width:280px;background:#4f46e5;color:#fff;text-decoration:none;font-size:16px;font-weight:600;padding:14px 24px;border-radius:10px;text-align:center;">
          ${actionLabel}
        </a>
      </div>
      <div style="background:#f9fafb;border:1px dashed #c7d2fe;border-radius:12px;padding:20px;text-align:center;margin-top:24px;">
        <p style="margin:0 0 8px;font-size:14px;color:#555;">Or enter this token in the app:</p>
        <p style="margin:0;font-size:20px;font-weight:700;letter-spacing:2px;color:#111;">${token}</p>
      </div>
      <p style="margin-top:24px;font-size:14px;color:#777;">
        If you didn't request this, you can safely ignore this email.<br/>Never share your token with anyone.
      </p>`;

    return emailShell({
      headerColor: '#4f46e5',
      headerText: EMAIL_SUBJECTS[topic],
      body,
      footerLabel: '&mdash; The <b>Banau</b> Team',
    });
  }
}
