import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { NextFunction, Request, Response } from 'express';
import { Logger } from 'nestjs-pino';
import { randomUUID } from 'node:crypto';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/http-exception.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.setGlobalPrefix('api', { exclude: ['health/{*path}'] });
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.use((request: Request, response: Response, next: NextFunction) => {
    request.id = request.headers['x-request-id']?.toString() ?? randomUUID();
    response.setHeader('x-request-id', request.id);
    next();
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  if (process.env.NODE_ENV !== 'production') {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('Fuel Queue Platform API')
        .setDescription('Versioned API contracts for the Fuel Queue Platform.')
        .setVersion('1.0')
        .build(),
    );
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '0.0.0.0');
}

void bootstrap();
