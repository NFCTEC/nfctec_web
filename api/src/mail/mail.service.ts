import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { type Transporter } from 'nodemailer';

export type InquiryEmailPayload = {
  name: string;
  company?: string;
  email: string;
  whatsapp?: string;
  country?: string;
  subject: string;
  message: string;
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;

  constructor(private config: ConfigService) {}

  private getTransporter(): Transporter | null {
    if (this.transporter) return this.transporter;

    const host = this.config.get<string>('SMTP_HOST');
    const port = Number(this.config.get<string>('SMTP_PORT') ?? 465);
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');

    if (!host || !user || !pass) {
      this.logger.warn('SMTP not configured — inquiry notification emails will be skipped');
      return null;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    return this.transporter;
  }

  async sendInquiryNotification(payload: InquiryEmailPayload): Promise<boolean> {
    const transporter = this.getTransporter();
    if (!transporter) return false;

    const to =
      this.config.get<string>('INQUIRY_NOTIFY_TO') ??
      this.config.get<string>('SMTP_USER') ??
      'support@nfctec.com';
    const from = this.config.get<string>('SMTP_FROM') ?? this.config.get<string>('SMTP_USER');

    const text = [
      `Name: ${payload.name}`,
      payload.company ? `Company: ${payload.company}` : null,
      `Email: ${payload.email}`,
      payload.whatsapp ? `WhatsApp: ${payload.whatsapp}` : null,
      payload.country ? `Country / Region: ${payload.country}` : null,
      '',
      'Message:',
      payload.message,
    ]
      .filter((line): line is string => line !== null)
      .join('\n');

    try {
      await transporter.sendMail({
        from,
        to,
        replyTo: payload.email,
        subject: `[Website Inquiry] ${payload.subject}`,
        text,
      });
      return true;
    } catch (err) {
      this.logger.error('Failed to send inquiry notification email', err);
      return false;
    }
  }
}
