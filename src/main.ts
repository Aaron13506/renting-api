import { NestFactory } from '@nestjs/core';
import { I18nValidationExceptionFilter } from 'nestjs-i18n';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import { ValidationPipe } from '@nestjs/common';

// import WebSocket from 'ws';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useGlobalFilters(
    new I18nValidationExceptionFilter({
      detailedErrors: process.env.NODE_ENV === 'develop',
    }),
  );

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  /*const wsServer = new WebSocket.Server({
    server: app.getHttpServer(),
    path: '/graphql',
  });*/

  app.use(bodyParser.json({ limit: '100mb' }));

  await app.listen(process.env.SERVER_PORT || 3000);
}

bootstrap();
