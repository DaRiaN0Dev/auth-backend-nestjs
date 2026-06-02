import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import type { AppConfig } from './config/app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.use(cookieParser());
  app.use(helmet());

  const configService = app.get(ConfigService);
  const appConfig = configService.get<AppConfig>('app');

  if (!appConfig) {
    throw new Error('Application configuration is not available');
  }

  await app.listen(appConfig.port);
}
bootstrap();
