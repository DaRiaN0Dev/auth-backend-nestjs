import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import type { AppConfig } from './config/app.config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.use(cookieParser());
  app.use(helmet());

  const configService = app.get(ConfigService);
  const appConfig = configService.get<AppConfig>('app');
  const nodeEnv = configService.get('NODE_ENV', { infer: true });
  const frontendUrl = configService.get('FRONTEND_URL', { infer: true });

  if (!appConfig) {
    throw new Error('Application configuration is not available');
  }

  // CORS Configuration
  if (nodeEnv === 'production') {
    app.enableCors({
      origin: frontendUrl,
      credentials: true,
    });
  } else {
    app.enableCors({
      origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000'],
      credentials: true,
    });
  }

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Auth Backend API')
    .setDescription('Production-ready authentication backend with JWT, RBAC, and email verification')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('auth', 'Authentication endpoints')
    .addTag('admin', 'Admin management endpoints')
    .addTag('health', 'Health check endpoint')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(appConfig.port);
}
bootstrap();
