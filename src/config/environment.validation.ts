import type { EnvVariables, NodeEnv } from '../types/env.types';

const allowedNodeEnvs: readonly NodeEnv[] = ['development', 'test', 'production'];
const durationPattern = /^\d+[smhd]$/i;

function readRequired(value: unknown, key: keyof EnvVariables): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

function parsePort(value: unknown): number {
  const portString = readRequired(value, 'PORT');
  const port = Number(portString);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535');
  }

  return port;
}

function parseNodeEnv(value: unknown): NodeEnv {
  const nodeEnv = readRequired(value, 'NODE_ENV') as NodeEnv;

  if (!allowedNodeEnvs.includes(nodeEnv)) {
    throw new Error(`NODE_ENV must be one of: ${allowedNodeEnvs.join(', ')}`);
  }

  return nodeEnv;
}

function parseDuration(value: unknown, key: 'ACCESS_TOKEN_EXPIRES_IN' | 'REFRESH_TOKEN_EXPIRES_IN'): string {
  const duration = readRequired(value, key);

  if (!durationPattern.test(duration.trim())) {
    throw new Error(`${key} must match duration format like 15m, 24h, or 30d`);
  }

  return duration;
}

export function validateEnvironment(config: Record<string, unknown>): EnvVariables {
  return {
    DATABASE_URL: readRequired(config.DATABASE_URL, 'DATABASE_URL'),
    PORT: parsePort(config.PORT),
    NODE_ENV: parseNodeEnv(config.NODE_ENV),
    JWT_ACCESS_SECRET: readRequired(config.JWT_ACCESS_SECRET, 'JWT_ACCESS_SECRET'),
    JWT_REFRESH_SECRET: readRequired(config.JWT_REFRESH_SECRET, 'JWT_REFRESH_SECRET'),
    ACCESS_TOKEN_EXPIRES_IN: parseDuration(
      config.ACCESS_TOKEN_EXPIRES_IN,
      'ACCESS_TOKEN_EXPIRES_IN',
    ),
    REFRESH_TOKEN_EXPIRES_IN: parseDuration(
      config.REFRESH_TOKEN_EXPIRES_IN,
      'REFRESH_TOKEN_EXPIRES_IN',
    ),
  };
}
