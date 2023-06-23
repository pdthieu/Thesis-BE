import { Module } from '@nestjs/common';
import { CoinselectService } from './coinselect.service';
import { CoinselectController } from './coinselect.controller';

@Module({
  providers: [CoinselectService],
  controllers: [CoinselectController],
  exports: [CoinselectService],
})
export class CoinselectModule {}
