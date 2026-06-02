import { registerAs } from '@nestjs/config';
import type { EnvVariables } from '../types/env.types';

export interface AppConfig {
  port: number;
  nodeEnv: EnvVariables['NODE_ENV'];
}

export default registerAs(
  'app',
  (): AppConfig => ({
    port: Number(process.env.PORT),
    nodeEnv: process.env.NODE_ENV as EnvVariables['NODE_ENV'],
  }),
);
