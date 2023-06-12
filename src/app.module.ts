import { HttpModule } from '@nestjs/axios';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import HealthModule from '@modules/health';
import LoggerModule, { RequestLoggerMiddleware } from '@modules/logger';
import { WinstonLoggerModule } from '@modules/logger/winston-logger.module';

import { dataSourceOptions } from './settings/typeorm';
import { BalanceModule } from '@modules/balance/balance.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot(dataSourceOptions),
    LoggerModule,
    WinstonLoggerModule,
    HttpModule,
    HealthModule.http(),
    BalanceModule.http(),
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
