import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import type { EmailConfig } from '../../config/email.config';
import { verifyEmailTemplate } from './templates/verify-email.template';
import { resetPasswordTemplate } from './templates/reset-password.template';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend;
  private readonly config: EmailConfig;

  constructor(private readonly configService: ConfigService) {
    this.config = this.configService.get<EmailConfig>('email')!;
    this.resend = new Resend(this.config.resendApiKey);
  }

  async sendVerificationEmail(to: string, name: string, token: string): Promise<void> {
    try {
      const actionUrl = `${this.config.frontendUrl}/verify-email?token=${token}`;
      const html = verifyEmailTemplate({ name, actionUrl });

      await this.resend.emails.send({
        from: this.config.emailFrom,
        to,
        subject: 'Verify Your Email Address',
        html,
      });

      this.logger.log(`Verification email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${to}:`, error);
      throw error;
    }
  }

  async sendPasswordResetEmail(to: string, name: string, token: string): Promise<void> {
    try {
      const actionUrl = `${this.config.frontendUrl}/reset-password?token=${token}`;
      const html = resetPasswordTemplate({ name, actionUrl });

      await this.resend.emails.send({
        from: this.config.emailFrom,
        to,
        subject: 'Reset Your Password',
        html,
      });

      this.logger.log(`Password reset email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${to}:`, error);
      throw error;
    }
  }
}
