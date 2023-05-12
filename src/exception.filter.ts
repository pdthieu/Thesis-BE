import { Request, Response } from 'express';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter as NestExceptionFilter,
  HttpException,
} from '@nestjs/common';

import { LoggerService } from '@modules/logger';

@Catch()
export class ExceptionFilter implements NestExceptionFilter {
  // exception can be either HttpException or any errors thrown in the app
  catch(exception: HttpException | Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;

    const message = (exception as any).response
      ? (exception as any).response.message
      : exception instanceof HttpException || exception instanceof Error
      ? exception.message
      : 'Unknown error';

    LoggerService.error(message, exception.stack);

    response.status(status).json({
      statusCode: status,
      message,
      path: request.url,
    });
  }
}
