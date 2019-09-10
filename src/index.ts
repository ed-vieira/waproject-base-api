import './global';

import { HttpException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as sentry from '@sentry/node';
import { ApplicationModule } from 'modules/';
import { RavenInterceptor } from 'nest-raven';
import { BUILD_NUMBER, IS_PROD, NODE_ENV, SENTRY_DSN } from 'settings';

sentry.init({
  dsn: SENTRY_DSN,
  environment: NODE_ENV,
  release: BUILD_NUMBER
});

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(ApplicationModule);

  app.useGlobalPipes(new ValidationPipe({ disableErrorMessages: IS_PROD, forbidUnknownValues: true }));

  app.enableCors();

  app.useGlobalInterceptors(
    new RavenInterceptor({
      filters: [{ type: HttpException, filter: (exception: HttpException) => 500 > exception.getStatus() }]
    })
  );

  const swaggerOptions = new DocumentBuilder()
    .setTitle('Eduzz Mobile API')
    .setDescription('Eduzz Orbita API')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerOptions);
  SwaggerModule.setup('/swagger', app, document);

  await app.listen(5000, '0.0.0.0', () => {
    console.log('******************************');
    console.log(`SERVER STARTED as ${NODE_ENV}`);
    console.log('******************************');
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error(reason);
    console.log(promise);
  });

  process.on('uncaughtException', err => {
    console.error(err);
  });

  process.on('SIGTERM', async () => {
    await app.close();
    process.exit(0);
  });
}

bootstrap().catch(err => console.error(err));
