export type NodeEnv = 'development' | 'test' | 'production';

export interface EnvVariables {
  DATABASE_URL: string;
  PORT: number;
  NODE_ENV: NodeEnv;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  ACCESS_TOKEN_EXPIRES_IN: string;
  REFRESH_TOKEN_EXPIRES_IN: string;
  APP_URL: string;
  FRONTEND_URL: string;
  RESEND_API_KEY: string;
  EMAIL_FROM: string;
}
