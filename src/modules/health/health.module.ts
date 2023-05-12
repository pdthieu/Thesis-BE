import { DynamicModule, Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { HealthController } from './health.controller';

@Module({
  imports: [TerminusModule],
})
export class HealthModule {
  public static http(): DynamicModule {
    return {
      module: HealthModule,
      controllers: [HealthController],
    };
  }
}
