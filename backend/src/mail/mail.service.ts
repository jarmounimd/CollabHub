import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: false, // Set to false for TLS
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
      tls: {
        rejectUnauthorized: false // Add this line to handle SSL issues
      }
    });
  }

  async sendVerificationEmail(to: string, token: string) {
    const url = `${this.configService.get<string>('FRONTEND_URL')}/auth/verify-email?token=${token}`;
    await this.transporter.sendMail({
      from: this.configService.get<string>('SMTP_FROM'),
      to,
      subject: 'Verify your email',
      html: `Click <a href="${url}">here</a> to verify your email.`,
    });
  }

  async sendPasswordResetEmail(to: string, token: string) {
    const url = `${this.configService.get<string>('FRONTEND_URL')}/auth/reset-password?token=${token}`;
    await this.transporter.sendMail({
      from: this.configService.get<string>('SMTP_FROM'),
      to,
      subject: 'Reset your password',
      html: `Click <a href="${url}">here</a> to reset your password.`,
    });
  }
}