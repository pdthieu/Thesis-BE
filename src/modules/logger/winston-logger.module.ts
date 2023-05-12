import { WinstonModule } from 'nest-winston';
import { Module } from '@nestjs/common';

import { loggerOptions } from '@settings/winston-logger.config';

@Module({
  imports: [WinstonModule.forRoot(loggerOptions)],
})
export class WinstonLoggerModule {}
