import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

import systemConfig from '@core/config/system';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private db: TypeOrmHealthIndicator,
  ) {}

  @Get('server')
  serverCheck() {
    return 'ok';
  }

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () =>
        this.http.pingCheck(
          'server',
          systemConfig.isProduction
            ? 'http://localhost:${systemConfig.port}/api/thesis/health/server'
            : `http://localhost:${systemConfig.port}/api/thesis/health/server`,
        ),
      () => this.db.pingCheck('database'),
    ]);
  }
}
