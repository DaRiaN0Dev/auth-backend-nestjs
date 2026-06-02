import { registerAs } from '@nestjs/config';

export interface EmailConfig {
  resendApiKey: string;
  emailFrom: string;
  appUrl: string;
  frontendUrl: string;
}

export default registerAs(
  'email',
  (): EmailConfig => ({
    resendApiKey: process.env.RESEND_API_KEY ?? '',
    emailFrom: process.env.EMAIL_FROM ?? '',
    appUrl: process.env.APP_URL ?? '',
    frontendUrl: process.env.FRONTEND_URL ?? '',
  }),
);
