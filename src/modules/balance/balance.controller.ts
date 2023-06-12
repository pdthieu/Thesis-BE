import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { BalanceService } from './balance.service';
import { GetBalanceAddressesDto, IBalance } from './balance.dto';

@ApiTags('balance')
@Controller('balance')
export class BalanceController {
  constructor(private readonly balanceSrv: BalanceService) {}

  @Get('/addrs')
  @ApiOkResponse({ type: [IBalance] })
  public async getBalanceAddreses(@Query() dto: GetBalanceAddressesDto) {
    console.log(dto);
    return this.balanceSrv.getBalanceAddresses(dto);
  }
}
