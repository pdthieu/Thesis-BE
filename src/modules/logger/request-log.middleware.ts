import dayjs from 'dayjs';
import { NextFunction, Request, Response } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Inject, Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    const start = dayjs();
    res.on('close', () => {
      this.logRequest({
        method: req.method,
        path: req.path,
        ms: dayjs().diff(start, 'millisecond'),
        statusCode: res.statusCode,
      });
    });
    next();
  }

  logRequest({ method, path, ms, statusCode }) {
    this.logger.http(`${method} ${path} ${ms}ms ${statusCode}`);
  }
}
