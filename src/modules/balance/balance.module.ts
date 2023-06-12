import { DynamicModule, Module } from '@nestjs/common';
import { BalanceController } from './balance.controller';
import { BalanceService } from './balance.service';
import { BlockcypherModule } from '@modules/blockcypher/blockcypher.module';

@Module({
  imports: [BlockcypherModule],
  providers: [BalanceService],
  exports: [BalanceService],
})
export class BalanceModule {
  public static http(): DynamicModule {
    return {
      module: BalanceModule,
      controllers: [BalanceController],
    };
  }
}
