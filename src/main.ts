import '@env';
import '@settings/typeorm-query';

import path, { resolve } from 'path';

import { json, urlencoded } from 'express';
import { WINSTON_MODULE_NEST_PROVIDER, WinstonModule } from 'nest-winston';
import { generateApi } from 'swagger-typescript-api';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import systemConfig from '@core/config/system';

import { loggerOptions } from './core/config/winston';
import { AppModule } from './app.module';
import { ExceptionFilter } from './exception.filter';
import { existsSync, mkdirSync, writeFileSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
    logger: WinstonModule.createLogger(loggerOptions),
  });

  app.setGlobalPrefix('api/thesis');

  // increase body limit
  app.use(json({ limit: '5mb' }));
  app.use(urlencoded({ extended: true, limit: '5mb' }));

  // validation
  app.useGlobalPipes(
    new ValidationPipe({
      enableDebugMessages: systemConfig.isDebugging,
      disableErrorMessages: systemConfig.isProduction,
      transform: true,
    }),
  );

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // enable cors
  app.enableCors({ credentials: true, origin: true });

  // trust proxy headers
  app.set('trust proxy', 1);

  app.useGlobalFilters(new ExceptionFilter());

  // enable swagger
  if (systemConfig.enableSwagger) {
    const options = new DocumentBuilder()
      .setTitle('Thesis BE')
      .setDescription('Powered by Hieu Phan')
      .setVersion('1.0.0')
      .build();

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api', app, document);

    // generate typescript api
    if (!systemConfig.isDebugging) {
      const docPath = path.resolve(__dirname, '../docs/');
      if (!existsSync(docPath)) {
        mkdirSync(docPath, { recursive: true });
      }
      writeFileSync(
        resolve(docPath, 'api-spec.json'),
        JSON.stringify(document, null, 2),
      );

      await generateApi({
        name: 'sdk',
        output: path.resolve(__dirname, '../src/api'),
        spec: document as any,
        templates: path.resolve(__dirname, '../src/swagger-templates'),
        prettier: {
          singleQuote: true,
          jsxSingleQuote: false,
          arrowParens: 'avoid',
          trailingComma: 'all',
          tabWidth: 2,
          printWidth: 100,
          parser: 'typescript',
          unwrapResponseData: true,
        },
        httpClientType: 'axios',
      });
    }
  }

  await app.listen(systemConfig.port, () => {
    Logger.log(
      `🚀 API server listenning on http://localhost:${systemConfig.port}/api`,
      'Bootstrap',
    );
  });
}
bootstrap();
